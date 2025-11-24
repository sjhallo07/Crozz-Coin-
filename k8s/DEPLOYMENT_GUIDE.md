# Kubernetes Deployment Guide

## Step-by-Step Deployment Instructions

### Phase 1: Preparation (Day 1-2)

#### 1.1 Build Docker Images

```bash
# Backend
cd backend
docker build -f Dockerfile.prod -t crozz-backend:v1.0.0 .

# Frontend
cd ../frontend
docker build -f Dockerfile.prod -t crozz-frontend:v1.0.0 .

# Test images locally
docker run -p 4000:4000 crozz-backend:v1.0.0
docker run -p 8080:80 crozz-frontend:v1.0.0
```

#### 1.2 Push to Container Registry

```bash
# Using Docker Hub
docker tag crozz-backend:v1.0.0 yourusername/crozz-backend:v1.0.0
docker push yourusername/crozz-backend:v1.0.0

docker tag crozz-frontend:v1.0.0 yourusername/crozz-frontend:v1.0.0
docker push yourusername/crozz-frontend:v1.0.0

# Or using GitHub Container Registry
docker tag crozz-backend:v1.0.0 ghcr.io/yourusername/crozz-backend:v1.0.0
docker push ghcr.io/yourusername/crozz-backend:v1.0.0
```

#### 1.3 Prepare Kubernetes Cluster

Choose your cloud provider:

**AWS EKS:**

```bash
eksctl create cluster \
  --name crozz-coin-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed
```

**GCP GKE:**

```bash
gcloud container clusters create crozz-coin-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --region=us-central1 \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10
```

**Azure AKS:**

```bash
az aks create \
  --resource-group crozz-coin-rg \
  --name crozz-coin-cluster \
  --node-count 3 \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10 \
  --node-vm-size Standard_D2s_v3
```

### Phase 2: Core Infrastructure Setup (Day 3-4)

#### 2.1 Install Essential Components

**Install cert-manager (for TLS):**

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=300s
```

**Install Nginx Ingress Controller:**

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.0/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=controller -n ingress-nginx --timeout=300s
```

**Install Sealed Secrets:**

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

**Install Metrics Server (for HPA):**

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### 2.2 Install Monitoring Stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

### Phase 3: Application Deployment (Day 5-7)

#### 3.1 Create and Configure Secrets

**Create secrets file:**

```bash
cat <<EOF > crozz-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: crozz-backend-secrets
  namespace: crozz-coin
type: Opaque
stringData:
  SUI_ADMIN_PRIVATE_KEY: "ed25519:YOUR_ACTUAL_KEY_HERE"
  ADMIN_TOKEN: "your-secure-admin-token-here"
  JWT_SECRET: "your-jwt-secret-here"
  CROZZ_PACKAGE_ID: "0xYOUR_PACKAGE_ID"
  CROZZ_TREASURY_CAP_ID: "0xYOUR_TREASURY_CAP_ID"
  CROZZ_ADMIN_CAP_ID: "0xYOUR_ADMIN_CAP_ID"
  CROZZ_REGISTRY_ID: "0xYOUR_REGISTRY_ID"
  CROZZ_METADATA_ID: "0xYOUR_METADATA_ID"
  CROZZ_DEFAULT_SIGNER: "0xYOUR_DEFAULT_SIGNER"
EOF
```

**Seal the secrets:**

```bash
kubeseal --format=yaml < crozz-secrets.yaml > crozz-secrets-sealed.yaml

# Delete the unencrypted file
rm crozz-secrets.yaml

# Apply sealed secret
kubectl apply -f crozz-secrets-sealed.yaml
```

#### 3.2 Deploy Using Helm

**Create values file for your environment:**

```bash
cat <<EOF > values-production.yaml
global:
  environment: production
  cloudProvider: aws  # or gcp, azure

backend:
  image:
    repository: yourusername/crozz-backend
    tag: v1.0.0
  replicaCount: 3

frontend:
  image:
    repository: yourusername/crozz-frontend
    tag: v1.0.0
  replicaCount: 3

ingress:
  enabled: true
  hosts:
    - host: crozz-coin.yourdomain.com
      paths:
        - path: /
          service: frontend
    - host: api.crozz-coin.yourdomain.com
      paths:
        - path: /
          service: backend
  tls:
    - secretName: crozz-tls-cert
      hosts:
        - crozz-coin.yourdomain.com
        - api.crozz-coin.yourdomain.com
EOF
```

**Deploy:**

```bash
helm install crozz-coin ./helm/crozz-coin \
  --namespace crozz-coin \
  --create-namespace \
  --values values-production.yaml \
  --wait
```

#### 3.3 Verify Deployment

```bash
# Check all resources
kubectl get all -n crozz-coin

# Check pods
kubectl get pods -n crozz-coin -o wide

# Check services
kubectl get svc -n crozz-coin

# Check ingress
kubectl get ingress -n crozz-coin

# Check HPA
kubectl get hpa -n crozz-coin

# Check logs
kubectl logs -f deployment/crozz-backend -n crozz-coin
kubectl logs -f deployment/crozz-frontend -n crozz-coin
```

### Phase 4: Security Hardening (Day 8-10)

#### 4.1 Apply Security Policies

```bash
# Network policies
kubectl apply -f k8s/security/network-policy.yaml

# RBAC
kubectl apply -f k8s/security/rbac.yaml

# Pod Security Standards
kubectl apply -f k8s/security/pod-security-policy.yaml
```

#### 4.2 Configure TLS

**Create ClusterIssuer:**

```bash
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

The ingress will automatically request certificates from Let's Encrypt.

#### 4.3 Enable Monitoring

```bash
# Apply ServiceMonitors
kubectl apply -f k8s/monitoring/servicemonitor.yaml

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Default credentials: admin / prom-operator
# Import dashboard from k8s/monitoring/grafana-dashboard.json
```

### Phase 5: Testing & Validation (Day 11-12)

#### 5.1 Smoke Tests

```bash
# Test backend health
kubectl run test --rm -it --restart=Never --image=curlimages/curl -n crozz-coin -- \
  curl -v http://crozz-backend-service:4000/health

# Test frontend
kubectl run test --rm -it --restart=Never --image=curlimages/curl -n crozz-coin -- \
  curl -v http://crozz-frontend-service:80/health

# Test external access
curl -v https://api.crozz-coin.yourdomain.com/health
curl -v https://crozz-coin.yourdomain.com/health
```

#### 5.2 Load Testing

```bash
# Install k6 or use existing load testing tool
kubectl run k6 --rm -it --restart=Never --image=grafana/k6 -n crozz-coin -- \
  run - <<EOF
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let res = http.get('http://crozz-backend-service:4000/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
EOF
```

#### 5.3 Verify Autoscaling

```bash
# Generate load
kubectl run -it --rm load-generator --image=busybox -n crozz-coin -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://crozz-backend-service:4000/health; done"

# Watch HPA in another terminal
kubectl get hpa -n crozz-coin -w

# Watch pods scaling
kubectl get pods -n crozz-coin -w
```

### Phase 6: Production Readiness (Day 13-15)

#### 6.1 Backup Configuration

```bash
# Install Velero for backups
velero install \
  --provider aws \
  --bucket crozz-coin-backups \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1

# Create backup schedule
velero schedule create crozz-coin-daily \
  --schedule="0 2 * * *" \
  --include-namespaces crozz-coin

# Test backup
velero backup create crozz-coin-test --include-namespaces crozz-coin
```

#### 6.2 Disaster Recovery Test

```bash
# Simulate disaster by deleting namespace
kubectl delete namespace crozz-coin

# Restore from backup
velero restore create --from-backup crozz-coin-test

# Verify restoration
kubectl get all -n crozz-coin
```

#### 6.3 Set Up Alerts

```bash
# Configure alertmanager
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    route:
      receiver: 'slack'
    receivers:
    - name: 'slack'
      slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK'
        channel: '#crozz-coin-alerts'
EOF
```

### Phase 7: Documentation & Handover (Day 16-20)

#### 7.1 Create Runbooks

Document common operations:

- Scaling procedures
- Rollback procedures
- Incident response
- Backup/restore procedures

#### 7.2 Team Training

- Kubectl basics
- Monitoring dashboard usage
- Alerting and incident response
- Troubleshooting guide

#### 7.3 Go-Live Checklist

- [ ] All pods running and healthy
- [ ] HPA configured and tested
- [ ] TLS certificates valid
- [ ] Monitoring and alerting active
- [ ] Backup schedule configured
- [ ] Security policies applied
- [ ] Load testing completed
- [ ] DR procedures tested
- [ ] Documentation complete
- [ ] Team trained

## Maintenance Procedures

### Regular Updates

```bash
# Update Helm release
helm upgrade crozz-coin ./helm/crozz-coin \
  --namespace crozz-coin \
  --reuse-values \
  --set backend.image.tag=v1.0.1

# Rollback if needed
helm rollback crozz-coin -n crozz-coin
```

### Monitoring

```bash
# Check cluster health
kubectl top nodes
kubectl top pods -n crozz-coin

# Check resource quotas
kubectl describe resourcequota -n crozz-coin

# Review events
kubectl get events -n crozz-coin --sort-by='.lastTimestamp'
```

### Scaling

```bash
# Manual scale
kubectl scale deployment crozz-backend -n crozz-coin --replicas=5

# Update HPA limits
kubectl patch hpa crozz-backend-hpa -n crozz-coin -p '{"spec":{"maxReplicas":15}}'
```

## Troubleshooting

### Pod Issues

```bash
# Describe pod
kubectl describe pod <pod-name> -n crozz-coin

# Get logs
kubectl logs <pod-name> -n crozz-coin --previous

# Execute commands
kubectl exec -it <pod-name> -n crozz-coin -- sh
```

### Network Issues

```bash
# Test connectivity
kubectl run netshoot --rm -it --image=nicolaka/netshoot -n crozz-coin -- bash
curl http://crozz-backend-service:4000/health

# Check DNS
kubectl run -it --rm --restart=Never busybox --image=busybox:1.28 -n crozz-coin -- nslookup crozz-backend-service
```

### Certificate Issues

```bash
# Check certificate status
kubectl describe certificate -n crozz-coin

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Force certificate renewal
kubectl delete certificate crozz-tls-cert -n crozz-coin
```

## Support Contacts

- **Kubernetes Admin**: admin@example.com
- **DevOps Team**: devops@example.com
- **On-Call**: +1-xxx-xxx-xxxx
- **Documentation**: https://github.com/sjhallo07/Crozz-Coin-
