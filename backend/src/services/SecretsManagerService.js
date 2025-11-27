import { IamAuthenticator } from '@ibm-cloud/secrets-manager/auth/index.js';
import SecretsManagerV2 from '@ibm-cloud/secrets-manager/secrets-manager/v2.js';

const SECRET_REF_PREFIX = 'sm://';
const SECRET_REF_SUFFIX = '_REF';
const secretCache = new Map();
let clientPromise;

function isSecretsManagerConfigured() {
  return Boolean(
    process.env.IBM_SM_API_KEY &&
      (process.env.IBM_SM_URL || (process.env.IBM_SM_INSTANCE_ID && process.env.IBM_SM_REGION))
  );
}

function buildServiceUrl() {
  if (process.env.IBM_SM_URL) {
    return process.env.IBM_SM_URL;
  }

  const instanceId = process.env.IBM_SM_INSTANCE_ID;
  const region = process.env.IBM_SM_REGION ?? 'us-south';

  if (!instanceId) return null;

  const variables = new Map([
    ['instance_id', instanceId],
    ['region', region],
  ]);

  return SecretsManagerV2.constructServiceUrl(variables);
}

async function getSecretsManagerClient() {
  if (clientPromise !== undefined) {
    return clientPromise;
  }

  if (!isSecretsManagerConfigured()) {
    clientPromise = Promise.resolve(null);
    return clientPromise;
  }

  const serviceUrl = buildServiceUrl();
  if (!serviceUrl) {
    clientPromise = Promise.resolve(null);
    return clientPromise;
  }

  const authenticator = new IamAuthenticator({ apikey: process.env.IBM_SM_API_KEY });

  const smClient = new SecretsManagerV2({
    authenticator,
    serviceUrl,
    headers: {
      'User-Agent': 'crozz-coin-backend',
    },
  });

  clientPromise = Promise.resolve(smClient);
  return clientPromise;
}

function parseSecretReference(reference) {
  if (!reference?.startsWith(SECRET_REF_PREFIX)) {
    return null;
  }

  const raw = reference.slice(SECRET_REF_PREFIX.length);
  const [path = '', fragment] = raw.split('#');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const secretId = segments[0];
  let versionId = null;

  if (segments.length >= 3 && segments[1] === 'versions') {
    versionId = segments[2];
  }

  const fieldPath = fragment ? fragment.split('.').filter(Boolean) : [];

  return { secretId, versionId, fieldPath };
}

function selectField(value, fieldPath = []) {
  if (!fieldPath.length) {
    return value;
  }

  return fieldPath.reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (!Object.prototype.hasOwnProperty.call(acc, part)) {
      return undefined;
    }
    // eslint-disable-next-line security/detect-object-injection
    return acc[part];
  }, value);
}

function normalizeSecretValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Buffer.isBuffer(value)) {
    return value.toString('utf8');
  }

  if (typeof value === 'object') {
    if (typeof value.payload === 'string') {
      return value.payload;
    }
    if (typeof value.text === 'string') {
      return value.text;
    }
    if (typeof value.value === 'string') {
      return value.value;
    }
    if (typeof value.data === 'string') {
      return value.data;
    }
    if (typeof value.data === 'object') {
      return JSON.stringify(value.data);
    }
    if (typeof value.credentials === 'object') {
      if (typeof value.credentials.apikey === 'string') {
        return value.credentials.apikey;
      }
      return JSON.stringify(value.credentials);
    }
  }

  return JSON.stringify(value);
}

function extractSecretPayload(secret, fieldPath) {
  const prioritized = [secret, secret?.resources?.[0], secret?.secret_data, secret?.versions?.[0]];

  for (const candidate of prioritized) {
    if (!candidate) continue;
    const selected = selectField(candidate, fieldPath);
    const normalized = normalizeSecretValue(selected);
    if (normalized !== null && normalized !== undefined) {
      return normalized;
    }
  }

  return null;
}

export async function resolveSecretReference(reference) {
  const parsed = parseSecretReference(reference);
  if (!parsed) {
    throw new Error(`Invalid secret reference format: ${reference}`);
  }

  const cacheKey = `${parsed.secretId}:${parsed.versionId ?? 'current'}:${
    parsed.fieldPath.join('.') || '*'
  }`;

  if (secretCache.has(cacheKey)) {
    return secretCache.get(cacheKey);
  }

  const client = await getSecretsManagerClient();
  if (!client) {
    throw new Error('Secrets Manager client is not configured');
  }

  let response;
  if (parsed.versionId) {
    response = await client.getSecretVersion({
      secretId: parsed.secretId,
      id: parsed.versionId,
    });
  } else {
    response = await client.getSecret({ id: parsed.secretId });
  }

  const value = extractSecretPayload(response.result, parsed.fieldPath);
  if (!value) {
    throw new Error(`Secret ${parsed.secretId} did not contain a usable payload`);
  }

  secretCache.set(cacheKey, value);
  return value;
}

export async function hydrateSecretsFromEnv() {
  const entries = Object.entries(process.env).filter(
    ([key, value]) => key.endsWith(SECRET_REF_SUFFIX) && typeof value === 'string'
  );

  if (entries.length === 0) {
    return { resolved: 0 };
  }

  let resolved = 0;

  for (const [refKey, reference] of entries) {
    if (!reference.startsWith(SECRET_REF_PREFIX)) continue;

    const targetKey = refKey.slice(0, -SECRET_REF_SUFFIX.length);
    // eslint-disable-next-line security/detect-object-injection
    if (Object.prototype.hasOwnProperty.call(process.env, targetKey) && process.env[targetKey]) {
      continue;
    }

    try {
      const value = await resolveSecretReference(reference);
      // eslint-disable-next-line security/detect-object-injection
      process.env[targetKey] = value;
      resolved += 1;
    } catch (error) {
      console.warn(`[secrets] Failed to resolve ${refKey}:`, error.message);
    }
  }

  return { resolved };
}

export function resetSecretsManagerClient() {
  clientPromise = undefined;
  secretCache.clear();
}

export function secretsManagerEnabled() {
  return isSecretsManagerConfigured();
}
