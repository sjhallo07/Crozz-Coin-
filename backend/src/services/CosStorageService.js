import COS from 'ibm-cos-sdk';

const DEFAULT_PREFIX = 'crozz';

class CosStorageService {
  constructor() {
    this.client = null;
    this.bucket = null;
    this.prefix = DEFAULT_PREFIX;
    this.region = null;
    this.endpoint = null;
    this.refreshFromEnv();
  }

  refreshFromEnv() {
    this.bucket = process.env.COS_BUCKET ?? null;
    this.prefix = process.env.COS_ARCHIVE_PREFIX ?? `${DEFAULT_PREFIX}/jobs`;
    this.region = process.env.COS_REGION ?? null;
    this.endpoint = process.env.COS_ENDPOINT ?? null;
    this.client = this.#createClient();
  }

  #createClient() {
    if (!this.bucket || !this.endpoint) {
      return null;
    }

    const config = {
      endpoint: this.endpoint,
      signatureVersion: 'v4',
    };

    if (this.region) {
      config.region = this.region;
    }

    const accessKeyId = process.env.COS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.COS_SECRET_ACCESS_KEY;
    const apiKeyId = process.env.COS_API_KEY;
    const serviceInstanceId = process.env.COS_RESOURCE_INSTANCE_ID;
    const iamEndpoint = process.env.COS_IAM_ENDPOINT;

    if (accessKeyId && secretAccessKey) {
      config.accessKeyId = accessKeyId;
      config.secretAccessKey = secretAccessKey;
    } else if (apiKeyId && serviceInstanceId) {
      config.apiKeyId = apiKeyId;
      config.serviceInstanceId = serviceInstanceId;
      config.signatureVersion = 'iam';
      if (iamEndpoint) {
        config.iamEndpoint = iamEndpoint;
      }
    } else {
      return null;
    }

    return new COS.S3(config);
  }

  isEnabled() {
    return Boolean(this.client && this.bucket);
  }

  buildObjectKey(jobId, status) {
    const safeJobId = jobId ?? 'unknown';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${this.prefix}/${safeJobId}/${timestamp}-${status}.json`;
  }

  async archiveJobSnapshot(job, status, detail) {
    if (!this.isEnabled()) {
      return false;
    }

    const key = this.buildObjectKey(job.id, status);
    const payload = {
      id: job.id,
      type: job.type,
      status,
      attempts: job.attempts,
      payload: job.payload,
      detail,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.#putJson(key, payload);
      return true;
    } catch (error) {
      console.warn(`[cos] Failed to archive job ${job.id}:`, error.message);
      return false;
    }
  }

  async #putJson(key, body) {
    const buffer = Buffer.from(JSON.stringify(body, null, 2));

    await this.client
      .putObject({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentLength: buffer.length,
        ContentType: 'application/json',
      })
      .promise();
  }
}

export const cosStorageService = new CosStorageService();
