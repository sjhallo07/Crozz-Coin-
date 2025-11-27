# IBM Cloud Storage Setup for Crozz Coin

This playbook walks through the storage stack recommended for Crozz Coin: Object Storage for artifacts and on-chain snapshots, Block Storage for the current SQLite database, and Secrets Manager for credentials. Follow the steps in order so every component is provisioned, secured, and referenced consistently across environments.

---

## 1. Prerequisites

- IBM Cloud CLI (`ibmcloud`) installed and logged in (`ibmcloud login --sso`).
- The `software-defined-storage` plugin installed (already available via `ibmcloud plugin show software-defined-storage`).
- Access to an IBM Cloud resource group where you can create Object Storage, Block Storage, and Secrets Manager instances.
- The Crozz Coin repository cloned locally with `.env` files created from `.env.example` and `frontend/.env.example`.

---

## 2. IBM Cloud Object Storage (COS)

Use COS for build artifacts, dashboard assets, deployment manifests, and historical logs.

1. **Create a COS instance**

   ```powershell
   ibmcloud resource service-instance-create crozz-cos standard cross-region global
   ```

   - Use `cross-region` or `regional` based on latency requirements.

2. **Create per-environment buckets**

   ```powershell
   ibmcloud cos bucket-create --bucket crozz-dev --class smart --region eu-de
   ibmcloud cos bucket-create --bucket crozz-prod --class standard --region eu-de
   ```

   - Match the region to where your backend/frontend workloads run.

3. **Generate service credentials with HMAC keys**

   ```powershell
   ibmcloud resource service-key-create crozz-cos-key Writer --instance-name crozz-cos --parameters '{"HMAC":true}'
   ibmcloud resource service-key crozz-cos-key
   ```

   - Note the `access_key_id`, `secret_access_key`, and `endpoint`.

4. **Store the credentials in Secrets Manager** (see Section 4) and reference them from your backend `.env`:

   ```env
   COS_ENDPOINT=https://s3.eu-de.cloud-object-storage.appdomain.cloud
   COS_API_KEY_REF=sm://crozz/cos/api-key
   COS_BUCKET=crozz-dev
   ```

5. **Wire COS into the backend**
   - The backend now ships with `CosStorageService` which reads `COS_BUCKET`, `COS_ENDPOINT`, `COS_ACCESS_KEY_ID`/`COS_SECRET_ACCESS_KEY` (or IAM credentials) and archives every executed job under `COS_ARCHIVE_PREFIX`.
   - Update `.env` (or `.env.example`) with the bucket, endpoint, region, and either HMAC keys or IAM credentials. Optionally provide `_REF` variants (e.g., `COS_SECRET_ACCESS_KEY_REF=sm://...`) to resolve secrets automatically via IBM Secrets Manager.
   - Every successful/failed transaction job automatically stores a JSON snapshot in COS. Use this archive as an immutable audit trail or to trigger downstream automation.

---

## 3. IBM Cloud Block Storage via SDS Plugin

Block Storage keeps the current SQLite database durable until you migrate to a managed database.

1. **Ensure the host (VM/container) is registered**

   ```powershell
   ibmcloud sds host-create --name crozz-backend --os-type RHEL8 --wwn HOST_WWN
   ```

   - Replace `HOST_WWN` with the World Wide Name of the compute host (obtain via `cat /etc/iscsi/initiatorname.iscsi` on Linux).

2. **Create storage credentials** (if not already configured)

   ```powershell
   ibmcloud sds cred-create --name crozz-sds-creds --username <storage-username> --password <storage-password>
   ```

3. **Provision a block volume**

   ```powershell
   ibmcloud sds volume-create --name crozz-sqlite --capacity 100 --iops 3000 --snapshot-space 10 --tier performance
   ```

   - Adjust capacity/IOPS per environment.

4. **Map the volume to the host**

   ```powershell
   ibmcloud sds host-mapping-create --host-name crozz-backend --volume-name crozz-sqlite
   ```

5. **Attach and mount the volume on the host**
   - Discover the iSCSI target: `iscsiadm -m discovery -t sendtargets -p <target-ip>`.
   - Log in: `iscsiadm -m node -T <target-iqn> -l`.
   - Create filesystem: `mkfs.xfs /dev/<device>`.
   - Mount at `/var/lib/crozz-data` (update `/etc/fstab` for persistence).

6. **Point the backend SQLite database to the mounted path**
   - Update `backend/.env`: `SQLITE_PATH=/var/lib/crozz-data/crozz.sqlite`.
   - Ensure Docker/Kubernetes manifests mount the block volume into the container at the same path.

---

## 4. IBM Cloud Secrets Manager

Centralize sensitive values (COS keys, SDS credentials, Sui private key, admin token).

1. **Create a Secrets Manager instance**

   ```powershell
   ibmcloud resource service-instance-create crozz-secrets secrets-manager enterprise eu-de
   ```

2. **Create a service credential with Reader access for your workloads**

   ```powershell
   ibmcloud resource service-key-create crozz-secrets-key Reader --instance-name crozz-secrets
   ibmcloud resource service-key crozz-secrets-key
   ```

3. **Store secrets**

   ```powershell
   ibmcloud secrets-manager secret-create --secret-type arbitary --metadata name=cos-api-key --resources '[{"payload":"<API_KEY>"}]'
   ibmcloud secrets-manager secret-create --secret-type arbitary --metadata name=cos-hmac-key --resources '[{"payload":"<HMAC_SECRET>"}]'
   ibmcloud secrets-manager secret-create --secret-type arbitary --metadata name=sds-password --resources '[{"payload":"<PASSWORD>"}]'
   ibmcloud secrets-manager secret-create --secret-type arbitary --metadata name=sui-admin-key --resources '[{"payload":"ed25519:..."}]'
   ```

4. **Reference secrets in `.env`**

   ```env
   COS_ACCESS_KEY_ID_REF=sm://crozz/cos/hmac-user
   COS_SECRET_ACCESS_KEY_REF=sm://crozz/cos/hmac-secret
   SUI_ADMIN_PRIVATE_KEY_REF=sm://crozz/sui/admin-key
   ADMIN_TOKEN_REF=sm://crozz/backend/admin-token
   ```

   - The backend automatically calls `hydrateSecretsFromEnv()` during startup. Any environment variable ending with `_REF` (and prefixed with `sm://`) is resolved through Secrets Manager before services are initialized. If a plain-text value is already present (e.g., `SUI_ADMIN_PRIVATE_KEY`), it is left untouched.
   - Secret lookups are cached for the process lifetime. Missing or malformed references emit warnings but do not crash the server, allowing you to mix local development values with production-only references.

## 5. Backend integration summary

- **Job archival:** `TransactionExecutor` feeds job outcomes to `CosStorageService`, which writes JSON snapshots to COS using the configured prefix/bucket. This replaces ad-hoc local log files and makes it easier to build dashboards or compliance exports.
- **Secrets hydration:** The new `SecretsManagerService` inspects all `_REF` variables, fetches them via IBM Cloud Secrets Manager (when configured), and populates their non-`_REF` counterparts before queues, routers, or the executor read configuration.
- **Block storage mounts:** Environment variables `CROZZ_DATA_DIR` and `CROZZ_DB_PATH` now default to `/var/lib/crozz-data/...` when running through Docker Compose. Mount the IBM Block Storage volume to that path (containers or hosts) to persist the SQLite database without code changes.

With these hooks enabled, deploying to IBM Cloud only requires updating environment files (or secret references)—code paths automatically pick up COS buckets, mounted block volumes, and Secrets Manager credentials.

---

## 6. CI/CD and Environment Sync

- **GitHub Actions / Tekton**: add steps that fetch secrets via `ibmcloud secrets-manager secret get` and export them before running tests/deployments.
- **Docker Compose**: mount the block storage volume into the backend service using the host path `/var/lib/crozz-data`.
- **Kubernetes/Iks**: create a `PersistentVolume`/`PersistentVolumeClaim` that binds to the IBM Block Storage volume, and mount it in the backend Deployment.
- **Monitoring**: enable COS access logs and set up alerts when block volume capacity nears limits.

---

## 7. Future Enhancements

1. **Migrate to IBM Cloud Databases for PostgreSQL** once the schema stabilizes. COS continues to store artifacts, while Block Storage can be repurposed for backups.
2. **Enable COS lifecycle policies** to tier old artifacts to Archive class, reducing cost.
3. **Automate SDS operations** via Ansible or Terraform using the same plugin commands.
4. **Integrate Vault-style rotation** by periodically rolling COS/SDS credentials in Secrets Manager and redeploying.

With these steps, Crozz Coin leverages IBM Cloud-native storage that’s durable, secure, and ready for future scaling.
