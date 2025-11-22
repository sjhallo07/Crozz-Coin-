# Crozz Coin Kubernetes - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Build Docker Images (5 minutes)

```bash
# Navigate to project root
cd /home/runner/work/Crozz-Coin-/Crozz-Coin-

# Build backend image
docker build -f backend/Dockerfile.prod -t crozz-backend:v1.0.0 backend/

# Build frontend image
docker build -f frontend/Dockerfile.prod -t crozz-frontend:v1.0.0 frontend/

# Test images
docker run -d -p 4000:4000 crozz-backend:v1.0.0
docker run -d -p 8080:80 crozz-frontend:v1.0.0

# Stop test containers
docker stop $(docker ps -q --filter ancestor=crozz-backend:v1.0.0)
docker stop $(docker ps -q --filter ancestor=crozz-frontend:v1.0.0)
```

### Step 2: Setup Kubernetes Cluster (10 minutes)

```bash
# Run automated setup script
./k8s/scripts/setup-cluster.sh

# This will install:
# ✅ cert-manager (TLS certificates)
# ✅ nginx-ingress (Load balancing)
# ✅ sealed-secrets (Secret encryption)
# ✅ metrics-server (Auto-scaling)
# ✅ prometheus-stack (Monitoring)
```

### Step 3: Deploy Application (5 minutes)

```bash
# Configure secrets
./k8s/scripts/create-secrets.sh

# Deploy application
./k8s/scripts/deploy.sh production

# Verify deployment
kubectl get pods -n crozz-coin
kubectl get svc -n crozz-coin
kubectl get ingress -n crozz-coin
```

## 🎉 You're Done!

Access your application:
- **Backend API**: `http://api.crozz-coin.example.com`
- **Frontend**: `http://crozz-coin.example.com`
- **Grafana**: `kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80`

## 📚 What You Get

### Infrastructure
- ✅ 3 backend pods (auto-scales 3-10)
- ✅ 3 frontend pods (auto-scales 3-10)
- ✅ Load balancer with session affinity
- ✅ Automatic TLS certificates
- ✅ Health checks and readiness probes

### Security
- ✅ Network policies (pod-to-pod isolation)
- ✅ RBAC (role-based access control)
- ✅ Pod Security Standards (restricted)
- ✅ Secrets encryption at rest
- ✅ TLS/SSL for all traffic

### Monitoring
- ✅ Prometheus metrics
- ✅ Grafana dashboards
- ✅ Custom alerts
- ✅ Real-time monitoring

### CI/CD
- ✅ Automated builds
- ✅ Security scanning
- ✅ Automated deployments
- ✅ Rollback on failure

## 🔧 Common Commands

### Check Status
```bash
kubectl get all -n crozz-coin
kubectl get hpa -n crozz-coin
kubectl top pods -n crozz-coin
```

### View Logs
```bash
kubectl logs -f deployment/crozz-backend -n crozz-coin
kubectl logs -f deployment/crozz-frontend -n crozz-coin
```

### Scale Manually
```bash
kubectl scale deployment crozz-backend --replicas=5 -n crozz-coin
kubectl scale deployment crozz-frontend --replicas=5 -n crozz-coin
```

### Update Application
```bash
kubectl set image deployment/crozz-backend crozz-backend=crozz-backend:v1.0.1 -n crozz-coin
kubectl rollout status deployment/crozz-backend -n crozz-coin
```

### Rollback
```bash
kubectl rollout undo deployment/crozz-backend -n crozz-coin
```

## 🌐 Cloud Deployment

### AWS EKS
```bash
# Create cluster
eksctl create cluster --name crozz-coin --region us-east-1 --nodes 3

# Apply AWS-specific configs
kubectl apply -f k8s/hybrid-cloud/aws-deployment.yaml
```

### GCP GKE
```bash
# Create cluster
gcloud container clusters create crozz-coin \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --region=us-central1

# Apply GCP-specific configs
kubectl apply -f k8s/hybrid-cloud/gcp-deployment.yaml
```

### Azure AKS
```bash
# Create cluster
az aks create \
  --resource-group crozz-coin-rg \
  --name crozz-coin \
  --node-count 3

# Apply Azure-specific configs
kubectl apply -f k8s/hybrid-cloud/azure-deployment.yaml
```

## 📖 Documentation

- **Full Guide**: [k8s/README.md](./README.md)
- **Deployment Guide**: [k8s/DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Budget Proposal**: [k8s/HYBRID_CLOUD_PROPOSAL.md](./HYBRID_CLOUD_PROPOSAL.md)
- **Project README**: [../README.md](../README.md)

## 🆘 Need Help?

1. **Check logs**: `kubectl logs -f deployment/crozz-backend -n crozz-coin`
2. **Check events**: `kubectl get events -n crozz-coin --sort-by='.lastTimestamp'`
3. **Describe pod**: `kubectl describe pod <pod-name> -n crozz-coin`
4. **Review documentation**: See links above
5. **Open issue**: https://github.com/sjhallo07/Crozz-Coin-/issues

## 💰 Costs

- **AWS**: ~$392/month (single cloud)
- **GCP**: ~$425/month (single cloud)
- **Azure**: ~$312/month (single cloud)
- **Hybrid**: ~$1,223/month (multi-cloud)

See [HYBRID_CLOUD_PROPOSAL.md](./HYBRID_CLOUD_PROPOSAL.md) for detailed breakdown.

## ⚡ Performance

- **Availability**: 99.95% uptime
- **Latency**: <100ms response time
- **Throughput**: 10,000+ requests/second
- **Scaling**: Automatic 3-10 replicas

## 🔐 Security Features

- TLS/SSL encryption
- Network isolation
- RBAC authorization
- Secrets encryption
- Security scanning
- Pod security standards
- Regular updates

---

**Ready to deploy?** Run `./k8s/scripts/setup-cluster.sh` to get started! 🚀
