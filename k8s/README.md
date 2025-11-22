# Crozz Coin Kubernetes Orchestration

Complete Kubernetes orchestration setup for Crozz Coin with security, monitoring, and hybrid cloud support.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [💰 Pricing & Free Trial](#pricing--free-trial)
- [Security Features](#security-features)
- [Hybrid Cloud Deployment](#hybrid-cloud-deployment)
- [Monitoring & Observability](#monitoring--observability)
- [Scaling](#scaling)
- [Disaster Recovery](#disaster-recovery)
- [Cost Optimization](#cost-optimization)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

This Kubernetes setup provides enterprise-grade orchestration for the Crozz Coin blockchain application with:

- **High Availability**: 3+ replicas with anti-affinity rules
- **Auto-scaling**: HPA based on CPU/Memory metrics
- **Security**: Network policies, RBAC, Pod Security Standards, encrypted secrets
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **Hybrid Cloud**: Deploy on AWS/GCP/Azure or on-premise
- **Zero-downtime deployments**: Rolling updates with PodDisruptionBudgets

## ✨ Features

### Security
- ✅ TLS/SSL encryption for all external traffic
- ✅ Network policies for pod-to-pod communication control
- ✅ RBAC (Role-Based Access Control)
- ✅ Pod Security Standards (Restricted profile)
- ✅ Secrets encryption at rest with Sealed Secrets
- ✅ Security headers and CSP
- ✅ Non-root containers with read-only root filesystem
- ✅ Resource quotas and limit ranges

### High Availability
- ✅ Multi-replica deployments (min 3 replicas)
- ✅ Pod anti-affinity for spreading across nodes
- ✅ PodDisruptionBudgets to maintain availability during updates
- ✅ Readiness and liveness probes
- ✅ Rolling update strategy

### Scalability
- ✅ Horizontal Pod Autoscaler (3-10 replicas)
- ✅ CPU and memory-based scaling
- ✅ Smart scale-up/scale-down policies
- ✅ Load balancing with session affinity

### Observability
- ✅ Prometheus metrics collection
- ✅ Grafana dashboards
- ✅ Custom alerting rules
- ✅ Structured logging
- ✅ Health check endpoints

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Ingress (TLS)                       │
│                   (nginx-ingress-controller)                │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
    ┌─────────▼─────────┐       ┌────────▼──────────┐
    │  Frontend Service │       │  Backend Service  │
    │   (ClusterIP)     │       │   (ClusterIP)     │
    └─────────┬─────────┘       └────────┬──────────┘
              │                          │
    ┌─────────▼─────────┐       ┌────────▼──────────┐
    │ Frontend Pods (3) │       │ Backend Pods (3)  │
    │   - Nginx         │       │   - Node.js       │
    │   - React SPA     │◄──────┤   - Express API   │
    │   - HPA enabled   │       │   - WebSocket     │
    └───────────────────┘       │   - HPA enabled   │
                                └───────────────────┘
                                        │
                                        │
                                ┌───────▼───────┐
                                │ Sui Blockchain│
                                │   (External)  │
                                └───────────────┘
```

## 📦 Prerequisites

### Required Tools
- Kubernetes cluster (1.24+)
- kubectl (1.24+)
- Helm 3.x (optional but recommended)
- Docker for building images

### Optional Tools
- cert-manager (for TLS certificates)
- prometheus-operator (for monitoring)
- sealed-secrets controller (for secret encryption)
- nginx-ingress-controller or cloud provider load balancer

### Cluster Requirements
- **Minimum**: 3 nodes, 4 vCPU, 8GB RAM per node
- **Recommended**: 5+ nodes, 8 vCPU, 16GB RAM per node
- **Storage**: 100GB+ persistent storage (for backups)
- **Network**: CNI with Network Policy support (Calico, Cilium, etc.)

## 🚀 Quick Start

### Option 1: Using kubectl

1. **Create namespace and apply base manifests:**
   ```bash
   kubectl apply -f k8s/base/namespace.yaml
   kubectl apply -f k8s/base/
   ```

2. **Apply security policies:**
   ```bash
   kubectl apply -f k8s/security/
   ```

3. **Configure secrets (IMPORTANT):**
   ```bash
   # Create secrets file from template
   cp k8s/base/secret.yaml k8s/base/secret-prod.yaml
   
   # Edit with your actual values
   nano k8s/base/secret-prod.yaml
   
   # Apply secrets
   kubectl apply -f k8s/base/secret-prod.yaml
   
   # Delete the file after applying (security best practice)
   rm k8s/base/secret-prod.yaml
   ```

4. **Verify deployment:**
   ```bash
   kubectl get all -n crozz-coin
   kubectl get hpa -n crozz-coin
   ```

### Option 2: Using Helm (Recommended)

1. **Install the chart:**
   ```bash
   helm install crozz-coin ./helm/crozz-coin \
     --namespace crozz-coin \
     --create-namespace \
     --set backend.secrets.SUI_ADMIN_PRIVATE_KEY="your-key" \
     --set backend.secrets.ADMIN_TOKEN="your-token" \
     --set ingress.hosts[0].host="your-domain.com"
   ```

2. **Verify installation:**
   ```bash
   helm status crozz-coin -n crozz-coin
   kubectl get all -n crozz-coin
   ```

3. **Upgrade release:**
   ```bash
   helm upgrade crozz-coin ./helm/crozz-coin \
     --namespace crozz-coin \
     --reuse-values
   ```

## 💰 Pricing & Free Trial

### Pay-As-You-Go Model

All cloud infrastructure uses **hourly billing** with no commitments:

| Provider | Hourly Rate | Monthly (24/7) | With Spot Instances |
|----------|-------------|----------------|---------------------|
| AWS | ~$0.53/hr | $392/month | ~$195/month (50% off) |
| GCP | ~$0.58/hr | $425/month | ~$170/month (60% off) |
| Azure | ~$0.43/hr | $312/month | ~$125/month (60% off) |

**You only pay for what you use!** Stop the cluster when not needed.

### FREE Testing Options

**Cloud Free Trials:**
- ✅ **AWS**: $300 credits for 90 days ([Sign up](https://aws.amazon.com/free/))
- ✅ **GCP**: $300 credits for 90 days ([Sign up](https://cloud.google.com/free/))
- ✅ **Azure**: $200 credits for 30 days ([Sign up](https://azure.microsoft.com/free/))
- ✅ **IBM Cloud**: Always Free Tier - Never expires! ([Sign up](https://cloud.ibm.com/registration)) ⭐

**IBM Cloud Free Tier (Recommended for Long-term Testing):**
- 1 worker node (2 vCPU, 4GB RAM) - **Forever FREE**
- 20GB storage included
- No credit card required
- Perfect for development and testing

**Local Testing (Unlimited):**
```bash
# Free forever using Minikube
minikube start --cpus=4 --memory=8192
kubectl apply -f k8s/base/
```

### Cost Optimization Tips

1. **Use free trials**: Test for 90 days at zero cost
2. **Spot instances**: Save 50-70% on compute
3. **Auto-scaling**: Scale down to 3 pods during low traffic
4. **Shut down when idle**: Pay only for hours used
5. **Local development**: Use Minikube for free testing

📚 **Complete pricing guide**: [PRICING_AND_TRIAL.md](./PRICING_AND_TRIAL.md)

## 🔒 Security Features

### 1. Network Policies

Restrict pod-to-pod communication:
```bash
kubectl apply -f k8s/security/network-policy.yaml
```

- Frontend can only communicate with Backend
- Backend can access external APIs (Sui blockchain)
- Default deny-all policy for undefined traffic

### 2. RBAC

Service accounts with minimal permissions:
```bash
kubectl apply -f k8s/security/rbac.yaml
```

### 3. Sealed Secrets (Recommended for Production)

Install Sealed Secrets controller:
```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

Seal your secrets:
```bash
# Install kubeseal CLI
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz
tar -xvzf kubeseal-0.24.0-linux-amd64.tar.gz
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

# Create and seal secret
kubectl create secret generic crozz-backend-secrets \
  --from-literal=SUI_ADMIN_PRIVATE_KEY="ed25519:YOUR_KEY" \
  --dry-run=client -o yaml | \
  kubeseal --format=yaml > sealed-secret.yaml

# Apply sealed secret
kubectl apply -f sealed-secret.yaml
```

### 4. TLS/SSL Configuration

Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

Create ClusterIssuer:
```yaml
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
```

## ☁️ Hybrid Cloud Deployment

### AWS (EKS)

1. **Create EKS cluster:**
   ```bash
   eksctl create cluster --name crozz-coin --region us-east-1 --nodes 3
   ```

2. **Apply AWS-specific configs:**
   ```bash
   kubectl apply -f k8s/hybrid-cloud/aws-deployment.yaml
   ```

3. **Configure IRSA:**
   ```bash
   eksctl create iamserviceaccount \
     --name crozz-backend-sa-aws \
     --namespace crozz-coin \
     --cluster crozz-coin \
     --attach-policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
     --approve
   ```

### GCP (GKE)

1. **Create GKE cluster:**
   ```bash
   gcloud container clusters create crozz-coin \
     --num-nodes=3 \
     --machine-type=n1-standard-4 \
     --region=us-central1
   ```

2. **Apply GCP-specific configs:**
   ```bash
   kubectl apply -f k8s/hybrid-cloud/gcp-deployment.yaml
   ```

3. **Configure Workload Identity:**
   ```bash
   gcloud iam service-accounts create crozz-backend
   
   gcloud iam service-accounts add-iam-policy-binding \
     crozz-backend@PROJECT_ID.iam.gserviceaccount.com \
     --role roles/iam.workloadIdentityUser \
     --member "serviceAccount:PROJECT_ID.svc.id.goog[crozz-coin/crozz-backend-sa-gcp]"
   ```

### Azure (AKS)

1. **Create AKS cluster:**
   ```bash
   az aks create \
     --resource-group crozz-coin-rg \
     --name crozz-coin \
     --node-count 3 \
     --enable-managed-identity
   ```

2. **Apply Azure-specific configs:**
   ```bash
   kubectl apply -f k8s/hybrid-cloud/azure-deployment.yaml
   ```

3. **Configure Azure AD Workload Identity:**
   ```bash
   az identity create --name crozz-backend-identity --resource-group crozz-coin-rg
   ```

### IBM Cloud (IKS) - FREE TIER Available! ⭐

**Perfect for long-term free testing with your IBM Cloud free tier account!**

1. **Install IBM Cloud CLI:**
   ```bash
   curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
   ibmcloud login
   ibmcloud plugin install kubernetes-service
   ```

2. **Create FREE cluster:**
   ```bash
   # Free tier cluster (no credit card required!)
   ibmcloud ks cluster create classic \
     --name crozz-coin-free \
     --location dal13 \
     --machine-type free \
     --workers 1
   
   # Wait for cluster to be ready (15-20 minutes)
   ibmcloud ks cluster get --cluster crozz-coin-free
   
   # Configure kubectl
   ibmcloud ks cluster config --cluster crozz-coin-free
   ```

3. **Apply IBM Cloud-specific configs:**
   ```bash
   kubectl apply -f k8s/hybrid-cloud/ibm-deployment.yaml
   ```

4. **Deploy with free tier optimizations:**
   ```bash
   # Deploy base configuration
   kubectl apply -f k8s/base/
   
   # Scale to 1 replica (free tier has 1 worker node)
   kubectl scale deployment crozz-backend --replicas=1 -n crozz-coin
   kubectl scale deployment crozz-frontend --replicas=1 -n crozz-coin
   ```

5. **Access your application:**
   ```bash
   # Get worker node public IP
   ibmcloud ks workers --cluster crozz-coin-free
   
   # Get service details
   kubectl get svc -n crozz-coin
   ```

**IBM Cloud Free Tier Benefits:**
- ✅ 1 worker node (2 vCPU, 4GB RAM) - Forever FREE
- ✅ 20GB block storage included
- ✅ Load balancer included
- ✅ No expiration - perfect for development!
- ✅ No credit card required

3. **Configure Azure AD Workload Identity:**
   ```bash
   az identity create --name crozz-backend-identity --resource-group crozz-coin-rg
   ```

### Multi-Cloud Strategy

For true hybrid deployment across multiple clouds:

1. **Use a service mesh (Istio/Linkerd)** for cross-cluster communication
2. **Deploy cluster per region/cloud:**
   - Primary: AWS us-east-1 (Production)
   - Secondary: GCP us-central1 (Failover)
   - Tertiary: Azure eastus (DR)
3. **Use external DNS** for automatic failover
4. **Replicate data** across regions using cloud-native tools

## 📊 Monitoring & Observability

### Install Prometheus & Grafana

Using kube-prometheus-stack:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### Apply ServiceMonitors

```bash
kubectl apply -f k8s/monitoring/servicemonitor.yaml
```

### Access Grafana

```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Username: admin
# Password: prom-operator
```

Import dashboard from `k8s/monitoring/grafana-dashboard.json`

### Key Metrics to Monitor

- **Availability**: Pod status, service uptime
- **Performance**: Request latency, throughput
- **Resources**: CPU, memory, disk usage
- **Errors**: HTTP 5xx rates, application errors
- **Scaling**: HPA metrics, replica counts

## 📈 Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment crozz-backend -n crozz-coin --replicas=5

# Scale frontend
kubectl scale deployment crozz-frontend -n crozz-coin --replicas=5
```

### Automatic Scaling (HPA)

HPA is configured to scale between 3-10 replicas based on:
- CPU utilization > 70%
- Memory utilization > 80%

View HPA status:
```bash
kubectl get hpa -n crozz-coin -w
```

### Cluster Autoscaling

Enable cluster autoscaler for node-level scaling:

**AWS:**
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

**GCP:**
```bash
gcloud container clusters update crozz-coin --enable-autoscaling --min-nodes=3 --max-nodes=10
```

**Azure:**
```bash
az aks update --resource-group crozz-coin-rg --name crozz-coin --enable-cluster-autoscaler --min-count 3 --max-count 10
```

## 💾 Disaster Recovery

### Backup Strategy

1. **Etcd backups** (automatic with managed Kubernetes)
2. **Application state backups:**
   ```bash
   # Using Velero
   velero install --provider aws --bucket crozz-backups
   velero backup create crozz-coin-backup --include-namespaces crozz-coin
   ```

3. **Database backups** (if using external DB):
   ```bash
   # Schedule periodic backups
   kubectl create cronjob backup --image=backup-tool --schedule="0 2 * * *"
   ```

### Restore Procedure

```bash
# Restore from Velero backup
velero restore create --from-backup crozz-coin-backup

# Verify restoration
kubectl get all -n crozz-coin
```

### Multi-Region Failover

1. Deploy to multiple regions
2. Use global load balancer (AWS Route53, GCP Cloud DNS, Azure Traffic Manager)
3. Configure health checks
4. Automatic failover on region failure

## 💰 Cost Optimization

### Resource Optimization

1. **Right-sizing:**
   ```bash
   # Analyze actual usage
   kubectl top pods -n crozz-coin
   kubectl top nodes
   ```

2. **Use spot instances** (50-90% cost savings):
   - AWS: EC2 Spot Instances
   - GCP: Preemptible VMs
   - Azure: Spot VMs

3. **Autoscaling:**
   - Scale down during low traffic
   - Use HPA to match demand

4. **Storage optimization:**
   - Use appropriate storage classes (gp2 → gp3 on AWS)
   - Clean up old persistent volumes

### Cost Monitoring

Enable cost allocation tags:
```bash
# AWS
kubectl label nodes --all cost-center=crozz-coin

# GCP
kubectl label nodes --all cost-center=crozz-coin

# Azure
kubectl label nodes --all cost-center=crozz-coin
```

## 🔧 Troubleshooting

### Common Issues

1. **Pods not starting:**
   ```bash
   kubectl describe pod <pod-name> -n crozz-coin
   kubectl logs <pod-name> -n crozz-coin
   ```

2. **Image pull errors:**
   ```bash
   # Check image pull secrets
   kubectl get secrets -n crozz-coin
   ```

3. **Network issues:**
   ```bash
   # Test pod connectivity
   kubectl run test --rm -it --image=busybox -n crozz-coin -- sh
   wget -O- http://crozz-backend-service:4000/health
   ```

4. **HPA not scaling:**
   ```bash
   # Check metrics server
   kubectl top nodes
   kubectl get apiservice v1beta1.metrics.k8s.io -o yaml
   ```

5. **TLS certificate issues:**
   ```bash
   # Check cert-manager
   kubectl get certificate -n crozz-coin
   kubectl describe certificate crozz-tls-cert -n crozz-coin
   ```

### Debug Commands

```bash
# Get all resources
kubectl get all -n crozz-coin

# Check events
kubectl get events -n crozz-coin --sort-by='.lastTimestamp'

# Check logs
kubectl logs -f deployment/crozz-backend -n crozz-coin

# Execute commands in pod
kubectl exec -it <pod-name> -n crozz-coin -- sh

# Port forward for local testing
kubectl port-forward svc/crozz-backend-service 4000:4000 -n crozz-coin
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)

## 🤝 Support

For issues and questions:
- GitHub Issues: https://github.com/sjhallo07/Crozz-Coin-/issues
- Documentation: See project README.md

## 📄 License

See LICENSE file in repository root.
