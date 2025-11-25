# IBM Cloud Deployment Blueprint for Crozz Coin

![Crozz Coin Logo](../frontend/public/crozz-logo.png)

**Official project URL:** [https://crozzcoin.com/](https://crozzcoin.com/)

This README distills the IBM Cloud deployment strategy for the Crozz Coin ecosystem (Move smart contract + Express APIs + React dashboard). Use it as your starting point when standing up new environments or onboarding operations teams. The primary mandate is to deploy the **entire Crozz Coin ecosystem on Sui mainnet** and release the CROZZ token using the most advanced, efficient IBM technologies available—zero tolerance for errors, maximum operational rigor.

---

## 1. End-to-end architecture

1. **Landing zone (VPC):** Deploy IBM Cloud Virtual Private Cloud with multi-zone subnets, security groups, and Flow Logs. Start from the "Landing zone for containerized applications with OpenShift" template if you need hardened defaults.
2. **Container control plane:**
   - **IBM Cloud Kubernetes Service (IKS)** for upstream Kubernetes 1.33 clusters when you need full control over autoscaling profiles and custom operators.
   - **Red Hat OpenShift on IBM Cloud (RHOIC)** for OpenShift 4.19 clusters with "Secure by Default" outbound policies when you want GitOps, Operators, and compliance add-ons out of the box.
3. **Image & delivery:** Build/push services to **IBM Cloud Container Registry**, then roll out with GitOps (OpenShift) or Helm/Tekton pipelines.
4. **Runtime split:**
   - **Backend + WebSocket relay** stay on IKS/RHOIC as long-running Deployments.
   - **Automation jobs** (Sui RPC reconciliation, CoinMarketCap crawlers, Move smoke tests) run on **IBM Cloud Code Engine** and scale to zero when idle.
5. **Data tier:**
   - **IBM Databases for PostgreSQL** for transactional data (users, admin actions, agreements).
   - **IBM Cloudant** for JSON/time-series dashboards and feature toggles.
   - **IBM Event Streams (Kafka)** for Sui on-chain events, executor job status, and market data fan-out.
6. **Observability & alerting:** **IBM Cloud Monitoring** (metrics) + **IBM Cloud Logs** (logs) with alert fan-out through **IBM Event Notifications** (email/SMS/webhook).
7. **Security & identity:** **IBM App ID** (auth, MFA), **IBM Secrets Manager** + **Key Protect** (secrets & HSM-backed keys), **IBM Cloud Internet Services (CIS)** (WAF, DDoS, TLS, bot management).
8. **Assist & support:** Embed **watsonx Assistant** (Lite/Plus/Enterprise) for 24/7 chat plus IBM Unified Support escalation hooks.

---

## 1.1 Blockchain technology requirements

The Crozz ecosystem is anchored on the **Sui blockchain** and requires the following components in every environment:

1. **Move package toolchain** – Maintain the `smart-contract/` package with `sui move build/test` pipelines, Mysten Move compiler, and the published `crozz_token` module. Sync the on-chain package ID with backend env vars (`CROZZ_PACKAGE_ID`, `CROZZ_TREASURY_CAP_ID`, `CROZZ_ADMIN_CAP_ID`, `CROZZ_REGISTRY_ID`).
2. **RPC and full-node access** – Point services to `https://fullnode.testnet.sui.io:443` (or the relevant mainnet/custom RPC). For enterprise isolation, run a private Sui full node behind IBM Cloud VPC (2 vCPU / 16 GB RAM baseline) and expose authenticated RPCs to backend + Code Engine jobs.
3. **Transaction executor** – Backend `TransactionExecutor` service signs Move transactions (mint/burn/distribute/freeze) using an Ed25519 admin key stored in Secrets Manager. Requires `SUI_ADMIN_PRIVATE_KEY`, `SUI_DEFAULT_GAS_BUDGET`, and dry-run toggle `CROZZ_EXECUTOR_DRY_RUN`.
4. **View/read methods** – Dashboard cards rely on Sui RPC methods (`suix_getBalance`, `suix_getDynamicFields`, `sui_getObject`) plus custom Move view functions (e.g., `get_total_supply`, `get_icon_url`). Ensure RPC budgets and rate limits accommodate 5s–15s polling plus WebSocket subscriptions.
5. **On-chain event ingestion** – Subscribe to Sui transaction digests via Mysten WebSocket or SuiScan APIs, normalize payloads, and publish to Event Streams topics (`sui-transfers`, `move-jobs`).
6. **Security controls** – Enforce signer separation (treasury vs executor), freeze toggles, and anti-bot registry fields defined in `crozz_token.move`. Keep registry/shared object IDs (`CROZZ_REGISTRY_INITIAL_SHARED_VERSION`) synchronized across environments.
7. **Monitoring & audits** – Stream Move tx digests and RPC metrics into Cloud Monitoring/Logs. Run scheduled Code Engine jobs that replays recent checkpoints to catch desynchronization or unauthorized mint/burn attempts.

These requirements ensure IBM reviewers understand the blockchain stack dependencies before approving infrastructure changes.

---

## 2. IBM Cloud services at a glance

| Category                | Service                               | Why it matters                                                                                                                    |
| ----------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Container orchestration | **IBM Cloud Kubernetes Service**      | Native Kubernetes 1.33 with VPC or classic networking, configurable worker pools, managed master.                                 |
|                         | **Red Hat OpenShift on IBM Cloud**    | OpenShift 4.19 with secure-by-default egress and operator ecosystem for regulated workloads.                                      |
| Serverless / batch      | **IBM Cloud Code Engine**             | Run containers, batch jobs, or functions that automatically scale to zero (perfect for nightly Move verification or price feeds). |
| Images                  | **IBM Cloud Container Registry**      | Highly available private registry with Vulnerability Advisor scans and quota controls.                                            |
| Data                    | **Databases for PostgreSQL**          | Managed HA Postgres (2+ members). Use for ledger snapshots, KYC, agreement tracking.                                              |
|                         | **Cloudant**                          | Fully managed JSON store/serverless throughput for dashboard caches, feature toggles.                                             |
| Streaming               | **Event Streams**                     | Managed Apache Kafka (Lite/Standard/Enterprise) to fan out on-chain, job, and price events.                                       |
| Observability           | **Cloud Monitoring**                  | Metrics + dashboards, optional platform metrics ingestion.                                                                        |
|                         | **Cloud Logs**                        | Log aggregation with store/search vs analyze/alert tiers and anomaly detection.                                                   |
| Notifications           | **Event Notifications**               | Multi-channel alerting (email/SMS/webhook/push) with Lite plan quotas.                                                            |
| Identity & secrets      | **App ID**                            | Authentication, social login, MFA, advanced password policies.                                                                    |
|                         | **Secrets Manager** + **Key Protect** | Dedicated secrets store backed by FIPS 140-2 Level 3 HSM-managed keys.                                                            |
| Edge & security         | **Cloud Internet Services**           | Cloudflare-powered WAF, DDoS, TLS, bot management, rate limiting.                                                                 |
| AI assistance           | **watsonx Assistant**                 | Embed IBM support chat and Crozz FAQ within the dashboard (Lite ≥1,000 MAUs free).                                                |

---

## 3. Deployment workflow

1. **Bootstrap landing zone**
   - Create VPC, subnets, security groups, Flow Logs.
   - Provision CIS for domain, TLS, WAF policies.
2. **Provision shared services**
   - Container Registry namespace, App ID instance, Secrets Manager + Key Protect, Event Streams topics, Monitoring/Logs instances, Event Notifications project.
3. **Spin up clusters**
   - Create IKS and/or RHOIC clusters in at least two zones. Enable autoscaling and node pools sized for backend/frontend/worker tiers.
4. **Configure CI/CD**
   - Build Docker images, push to Container Registry, deploy via Helm or OpenShift GitOps. Use Tekton or GitHub Actions for pipelines.
5. **Deploy workloads**
   - Backend (Express + TransactionExecutor) and WebSocket relay on the cluster.
   - Frontend dashboard via Vite build served by NGINX pod or Object Storage static hosting behind CIS.
   - Code Engine projects for scheduled jobs (market data, Sui watchers, Move smoke tests).
6. **Wire data/queues**
   - Connect backend to PostgreSQL + Cloudant.
   - Publish Sui RPC + market feeds into Event Streams; subscribe from dashboard/analytics workers.
7. **Enable observability**
   - Install Monitoring/Logging agents, forward application logs, create SLO dashboards and alerts that trigger Event Notifications.
8. **Cutover and test**
   - Run `scripts/run-crozz-automation.ps1` or `scripts/test_crozz.sh` against the new environment.
   - Verify watsonx Assistant chat, App ID MFA, CIS WAF, and WebSocket updates.

---

## 4. Security & compliance checklist

| Area               | Action                                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity           | Use App ID for user + staff auth, enforce MFA and advanced password policy, map groups to backend RBAC (`authMiddleware`).                                                          |
| Secrets            | Store `SUI_ADMIN_PRIVATE_KEY`, JWT secrets, API tokens in Secrets Manager; wrap master keys with Key Protect; rotate quarterly.                                                     |
| Network            | Enforce CIS WAF rules, rate limiting, bot management; restrict outbound traffic with VPC ACLs/OpenShift "Secure by Default" policies.                                               |
| Data protection    | Enable TLS 1.2+, use database encryption at rest (IBM-managed) plus customer-managed keys; create read replicas for analytics.                                                      |
| Anti-abuse         | Implement CAPTCHA through App ID or frontend challenge on registration; feed CIS bot analytics into Cloud Logs for anomaly detection.                                               |
| Monitoring         | Configure Cloud Monitoring/Logs alerts for RPC latency, job backlog, failed Move tx, auth anomalies; deliver via Event Notifications.                                               |
| Legal & agreements | Require ToS acceptance (logged in PostgreSQL) for users/holders. Include clauses that Carlo Hung (owner) and Marcos Mora (developer) are not liable for custodial responsibilities. |
| DR/BCP             | Schedule PostgreSQL backups, replicate Cloudant to a second region, snapshot Move artifacts to Object Storage, and rehearse restore monthly.                                        |

---

### 4.1 Legal agreements & governance

1. **Developer service agreement (Marcos Mora)**
   - Marcos Mora is the principal builder of the Crozz ecosystem. He retains all intellectual-property rights to the codebase, smart contracts, infrastructure definitions, dashboards, and automation scripts until he receives full payment for services rendered **and** submits a transfer invoice to IBM confirming assignment.
   - Until that notification is accepted, Marcos Mora grants Carlo Hung and IBM a non-exclusive license to operate the platform but carries **zero liability** for any losses, rug pulls, market crashes, misuse of CROZZ tokens, or business decisions made by ecosystem participants.
   - Any maintenance, upgrades, smart-contract edits, or production configuration changes authored by Marcos Mora must be explicitly authorized in writing by Carlo Hung before execution.

2. **Owner protections (Carlo Hung)**
   - Carlo Hung is the sole owner and ultimate authority over the Crozz Coin ecosystem. He holds 100% of governance rights, treasury decisions, feature approvals, and access grants/revocations.
   - No third party (including developers, admins, or IBM staff) may override Carlo Hung’s directives. All operational permissions flow from him and can be rescinded at any time.

3. **User & holder agreement**
   - Every user/holder must accept the ecosystem terms which state that Carlo Hung’s policies are final. Participation requires acknowledging that permissions, token utilities, or access can be granted or withdrawn solely by Carlo Hung.
   - Users agree that they assume full responsibility for financial risk, trading outcomes, or smart-contract interactions and that neither Carlo Hung nor Marcos Mora acts as custodian of assets.

> 📌 Keep the signed agreements (developer contract, owner declaration, user ToS) inside `docs/legal/` and reference them during IBM compliance reviews.

---

## 5. Dashboard & automation highlights

- **Market intelligence**: Code Engine job fetches CoinMarketCap Top-10, SUI price, and Crozz price, caches in Cloudant, and pushes updates via Event Streams to the React dashboard.
- **On-chain insight**: Backend proxies Sui RPC and SuiScan data so WebSocket clients see mint/burn/distribute/freeze events in near real time.
- **Admin control**: Dashboard surfaces mint/burn/distribute/freeze actions queued through `TransactionService`, executed by TransactionExecutor (dry-run toggle via `CROZZ_EXECUTOR_DRY_RUN`).
- **Feature toggles**: Store new Move entrypoints or dashboard widgets in Cloudant/App Configuration so admins can enable/disable without redeploys.
- **IBM helpdesk**: watsonx Assistant widget embedded in the dashboard routes issues to IBM support or internal staff 24/7.

---

## 6. Ops & support runbook

1. **Daily**: Monitor Cloud Monitoring dashboards, check Event Streams lag, ensure Code Engine jobs completed, review Cloud Logs anomalies.
2. **Weekly**: Rotate temporary admin tokens, review App ID audit logs, snapshot repositories to Object Storage, test WebSocket failover.
3. **Monthly**: Patch base images, upgrade cluster versions (IKS/OpenShift), rehearse DR restores, update watsonx Assistant intents.
4. **Incident response**: Use Event Notifications to page on-call staff; reference `TESTNET_DEPLOYMENT_NOTICE.md` for credential handling.

---

## 6.1 Lifecycle management & IBM NLP request

For the entire **Alpha → Beta → Omega** deployment and the official launch of the Crozz Coin ecosystem and token—covering social media creation, content ideation, marketing plan development, and community building aligned with the mission, vision, and goals from the white paper—we request IBM’s NLP and data-analysis tooling to drive exponential, targeted growth. This includes leveraging watsonx APIs to craft messaging, sentiment analysis to guide campaigns, and analytics pipelines to measure traction against short- and long-term KPIs.

Please coordinate with IBM marketing/AI specialists so these workflows stay in sync with the white paper’s lifecycle blueprint.

---

## 7. Repository guide

| Path              | Purpose                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `frontend/`       | React + Vite dashboard (hooks, providers, Sui client helpers, UI components).             |
| `backend/`        | Express REST + WebSocket server, TransactionService/Executor, Sui proxy routes.           |
| `smart-contract/` | Move package (`crozz_token.move`, `Move.toml`).                                           |
| `scripts/`        | Automation (quick-start, tunnel setup, Move publish/test, crozz automation, smoke tests). |
| `deployment/`     | Turn-key deployment artifacts (`execute-deployment.sh`, wallet files, ops docs).          |
| `docs/`           | Additional guides (security, testing, quick starts, and this README).                     |

Need deeper details? Start with [`IMPLEMENTATION_SUMMARY.md`](../IMPLEMENTATION_SUMMARY.md) and [`TESTNET_DEPLOYMENT_NOTICE.md`](../TESTNET_DEPLOYMENT_NOTICE.md) for environment-specific caveats.

1 234

---

## 8. IBM white paper attachment

To keep IBM stakeholders aligned, bundle the latest Crozz Coin white paper directly in this `docs/` tree:

1. Drop the PDF (or Markdown) into `docs/whitepaper/` (create the folder if it does not exist) and follow the naming pattern `Crozz-Coin-Whitepaper-v<YYMMDD>.pdf`.
2. Reference supporting assets (tokenomics spreadsheets, governance diagrams) inside the same directory so IBM reviewers can access them offline.
3. Update this README with the file link whenever you publish a new revision. Example:
   - `[Crozz Coin White Paper – v2025-11-24](whitepaper/Crozz-Coin-Whitepaper-v20251124.pdf)`
   - `[Crozz Coin White Paper – Google Docs (IBM Access)](https://docs.google.com/document/d/1JY_VYszHzHpfCqSNy97kkLe4TPymJWaE_UBMzolFs08/edit?tab=t.0#heading=h.8oi7keys0icb)` → ensure IBM reviewers are granted view rights before sharing.
4. When sharing with IBM Cloud account teams, include this README plus the white paper archive to provide architecture + product context in a single package.

> 📌 Tip: store draft versions in a private bucket or Git branch until they are cleared for IBM distribution, then copy the signed PDF into `docs/whitepaper/`.
