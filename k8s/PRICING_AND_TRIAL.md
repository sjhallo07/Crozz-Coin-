# Crozz Coin Kubernetes - Pricing & Trial Options

## 💰 Pay-As-You-Go Pricing Model

The infrastructure uses a **pay-as-you-go** model where you only pay for what you use:

### Cloud Infrastructure Costs (Pay-as-you-go)

All major cloud providers bill **hourly** with no long-term commitments:

| Component | AWS (Hourly) | GCP (Hourly) | Azure (Hourly) |
|-----------|--------------|--------------|----------------|
| **Cluster Control Plane** | $0.10/hr ($144/mo) | $0.10/hr ($73/mo) | Free | 
| **Worker Nodes (3x)** | $0.0416/hr each ($219/mo) | $0.0296/hr each ($156/mo) | $0.0262/hr each ($138/mo) |
| **Load Balancer** | $0.025/hr ($16.20/mo) | $0.025/hr ($18/mo) | $0.025/hr ($18.45/mo) |
| **Storage (100GB)** | $0.10/GB/mo | $0.17/GB/mo | $0.192/GB/mo |
| **Data Transfer** | $0.09/GB | $0.12/GB | $0.087/GB |

**Total Hourly Rates:**
- **AWS**: ~$0.53/hour = **$392/month** if running 24/7
- **GCP**: ~$0.58/hour = **$425/month** if running 24/7
- **Azure**: ~$0.43/hour = **$312/month** if running 24/7

### 💡 Cost Savings Tips

**You can reduce costs by:**
1. **Shutting down when not in use**: Only pay for hours running
2. **Using spot instances**: 50-70% discount
3. **Auto-scaling down**: Scale to minimum (3 pods) during low traffic
4. **Development environment**: Use smaller instances or local Kubernetes (minikube/kind)

---

## 🧪 Trial & Testing Options

### Option 1: Free Trial Credits (Recommended)

All major cloud providers offer **free trial credits**:

| Provider | Free Credits | Duration | Perfect For |
|----------|--------------|----------|-------------|
| **AWS** | $300 | 90 days | Full production testing |
| **GCP** | $300 | 90 days | Complete implementation |
| **Azure** | $200 | 30 days | Initial proof-of-concept |
| **IBM Cloud** | Always Free Tier | Unlimited | Long-term free hosting ✅ |

**With free credits, you can:**
- ✅ Test the complete Kubernetes setup
- ✅ Run for **60-90 days** at no cost
- ✅ Validate all features (auto-scaling, monitoring, security)
- ✅ Load test and benchmark performance

**IBM Cloud Free Tier (No Expiration):**
- ✅ **1 worker node** (2 vCPU, 4GB RAM)
- ✅ **20GB block storage**
- ✅ **Network egress included**
- ✅ **Load balancer included**
- ✅ **No credit card required**
- ✅ **Never expires** - perfect for long-term testing!

**Steps to get started:**
1. Sign up for cloud provider free trial
2. Use the provided credits
3. Deploy using our automation scripts
4. Test for 30-90 days at no cost (or unlimited with IBM Cloud!)

---

### Option 2: Local Kubernetes Testing (Free Forever)

Test the complete setup **locally** at zero cost:

#### Using Minikube (Recommended for testing)

```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start local cluster
minikube start --cpus=4 --memory=8192 --driver=docker

# Deploy Crozz Coin
kubectl config use-context minikube
./k8s/scripts/setup-cluster.sh
./k8s/scripts/create-secrets.sh
./k8s/scripts/deploy.sh production

# Access the application
minikube service crozz-frontend-service -n crozz-coin
minikube service crozz-backend-service -n crozz-coin
```

#### Using Kind (Kubernetes in Docker)

```bash
# Install Kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Create cluster
kind create cluster --name crozz-coin

# Deploy
kubectl apply -f k8s/base/
```

#### Using Docker Desktop (Windows/Mac)

```bash
# Enable Kubernetes in Docker Desktop settings
# Then deploy:
kubectl apply -f k8s/base/
```

**Local Testing Benefits:**
- ✅ **Free**: No cloud costs
- ✅ **Unlimited time**: Test as long as you need
- ✅ **Fast iteration**: Quick deployments
- ✅ **Same manifests**: Use production configs

---

### Option 3: Development Environment (Minimal Cost)

Run a **minimal setup** for extended testing:

```bash
# Use single node with small instances
# AWS: t3.small = $0.0208/hour = $15/month
# GCP: e2-small = $0.0168/hour = $12/month
# Azure: B2s = $0.0416/hour = $30/month

# Scale down to 1 replica
kubectl scale deployment crozz-backend --replicas=1 -n crozz-coin
kubectl scale deployment crozz-frontend --replicas=1 -n crozz-coin

# Estimated cost: $12-30/month
```

---

## 📅 Recommended Testing Timeline

### Phase 1: Local Testing (Days 1-7) - FREE
- ✅ Test deployment scripts
- ✅ Validate Kubernetes manifests
- ✅ Check health endpoints
- ✅ Test basic functionality
- **Cost: $0**

### Phase 2: Cloud Trial (Days 8-37) - FREE
- ✅ Deploy to AWS/GCP/Azure free trial
- ✅ Test auto-scaling under load
- ✅ Validate security policies
- ✅ Test monitoring and alerting
- ✅ Performance benchmarking
- **Cost: $0** (using free credits)

### Phase 3: Extended Testing (Days 38-60) - LOW COST
- ✅ Continue on free credits (AWS/GCP give 90 days)
- ✅ OR use minimal setup ($12-30/month)
- ✅ Long-term stability testing
- ✅ Team training and onboarding
- **Cost: $0-60** (depending on provider and setup)

### Phase 4: Production (Day 61+) - FULL COST
- ✅ Scale to production settings
- ✅ Enable all replicas (3-10)
- ✅ Full monitoring and alerting
- **Cost: $312-425/month** (single cloud, pay-as-you-go)

---

## 🎯 Summary: Your Testing Period

### FREE Testing: Up to 90 Days

**Option A: Cloud Free Trials**
- **AWS**: 90 days with $300 credits ✅ **RECOMMENDED**
- **GCP**: 90 days with $300 credits ✅ **RECOMMENDED**
- **Azure**: 30 days with $200 credits

**Option B: Local Testing**
- **Unlimited time** for free
- Use Minikube, Kind, or Docker Desktop
- Perfect for development and initial testing

### Recommended Approach

**Week 1-2: Local Testing (FREE)**
```bash
# Deploy locally
minikube start
./k8s/scripts/setup-cluster.sh
./k8s/scripts/deploy.sh production
```

**Week 3-12: Cloud Trial (FREE)**
```bash
# Sign up for AWS/GCP free trial
# Deploy to cloud
# Use all features with free credits
```

**After 90 days: Pay-as-you-go**
- Only charged for actual usage
- Can start/stop anytime
- No minimum commitments

---

## 💡 Cost Optimization During Testing

### 1. Use Free Tiers
- **AWS**: t3.micro included in free tier (first 12 months)
- **GCP**: e2-micro always free (1 instance)
- **Azure**: B1S free for 12 months

### 2. Shut Down When Not Testing
```bash
# Stop all pods (keeps configuration)
kubectl scale deployment --all --replicas=0 -n crozz-coin

# Restart when needed
kubectl scale deployment crozz-backend --replicas=3 -n crozz-coin
kubectl scale deployment crozz-frontend --replicas=3 -n crozz-coin
```

### 3. Use Spot Instances
- AWS Spot: 50-70% discount
- GCP Preemptible: 60-91% discount  
- Azure Spot: 60-90% discount

### 4. Test During Business Hours Only
- Run 8 hours/day instead of 24/7
- Reduces costs by 66%
- Example: $392/month → $130/month

---

## 📊 Testing Cost Calculator

| Testing Scenario | Cloud Provider | Duration | Estimated Cost |
|------------------|----------------|----------|----------------|
| **Local Testing** | None (Minikube) | Unlimited | **$0** |
| **AWS Free Trial** | AWS | 90 days | **$0** ($300 credits) |
| **GCP Free Trial** | GCP | 90 days | **$0** ($300 credits) |
| **Azure Free Trial** | Azure | 30 days | **$0** ($200 credits) |
| **Minimal Setup** | Any | 30 days | **$12-30** |
| **8hrs/day Testing** | AWS | 30 days | **$130** |
| **Full Production** | AWS | 30 days | **$392** |

---

## 🚀 How to Start Your FREE Trial

### AWS (90 days, $300 credits)

1. **Sign up**: https://aws.amazon.com/free/
2. **Verify account**: Credit card required (not charged)
3. **Create EKS cluster**:
   ```bash
   eksctl create cluster --name crozz-coin-test --region us-east-1 --nodes 3 --node-type t3.medium
   ```
4. **Deploy**:
   ```bash
   ./k8s/scripts/setup-cluster.sh
   ./k8s/scripts/deploy.sh production
   ```
5. **Monitor credits**: AWS Billing Dashboard

### GCP (90 days, $300 credits)

1. **Sign up**: https://cloud.google.com/free/
2. **Activate trial**: Automatic $300 credits
3. **Create GKE cluster**:
   ```bash
   gcloud container clusters create crozz-coin-test --num-nodes=3 --machine-type=n1-standard-2
   ```
4. **Deploy**:
   ```bash
   ./k8s/scripts/setup-cluster.sh
   ./k8s/scripts/deploy.sh production
   ```
5. **Monitor credits**: GCP Console → Billing

### Azure (30 days, $200 credits)

1. **Sign up**: https://azure.microsoft.com/free/
2. **Activate trial**: $200 credits for 30 days
3. **Create AKS cluster**:
   ```bash
   az aks create --resource-group crozz-test --name crozz-coin-test --node-count 3
   ```
4. **Deploy**:
   ```bash
   ./k8s/scripts/setup-cluster.sh
   ./k8s/scripts/deploy.sh production
   ```
5. **Monitor credits**: Azure Portal → Cost Management

---

## ⚠️ Important Notes

**During Free Trial:**
- ✅ All features available (no restrictions)
- ✅ Same performance as paid accounts
- ✅ Can test production workloads
- ✅ Full monitoring and logging included
- ⚠️ Need credit card for verification (not charged during trial)
- ⚠️ Automatically converts to pay-as-you-go after trial (can cancel before)

**After Free Trial:**
- You can export all configurations
- Move to different provider
- Run locally with Minikube
- Or continue with pay-as-you-go

---

## 📞 Questions?

**Q: Do I need to commit to any minimum period?**  
A: No! Pay-as-you-go means you can stop anytime. Only pay for hours used.

**Q: What happens after free trial ends?**  
A: You can either continue with pay-as-you-go billing or export your setup and move elsewhere.

**Q: Can I test for longer than 90 days for free?**  
A: Yes! Use local Kubernetes (Minikube) for unlimited free testing.

**Q: Will I be charged automatically?**  
A: Not during free trial. After trial, you must manually enable billing to continue.

**Q: Can I switch providers after testing?**  
A: Yes! All Kubernetes configs work across AWS/GCP/Azure. Just apply the cloud-specific manifests.

---

## 🎁 IBM Cloud Free Tier (Your Best Option!)

### Why IBM Cloud Free Tier is Perfect for Crozz Coin

Since you have an **IBM Cloud free tier account**, this is an excellent option for running Crozz Coin:

**IBM Cloud Free Tier Benefits:**
- ✅ **Always Free** - Never expires (unlike AWS/GCP 90-day trials)
- ✅ **No Credit Card Required** - True free tier
- ✅ **1 Worker Node** - 2 vCPU, 4GB RAM (perfect for testing)
- ✅ **20GB Block Storage** - Included
- ✅ **Load Balancer** - Included
- ✅ **Network Egress** - Included
- ✅ **Perfect for Development** - Long-term hosting at zero cost

### Deploy to IBM Cloud Free Tier

#### Step 1: Install IBM Cloud CLI

```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login to IBM Cloud
ibmcloud login

# Install Kubernetes plugin
ibmcloud plugin install kubernetes-service
```

#### Step 2: Create Free Kubernetes Cluster

```bash
# Create free tier cluster (takes 15-20 minutes)
ibmcloud ks cluster create classic \
  --name crozz-coin-free \
  --location dal13 \
  --machine-type free \
  --workers 1

# Wait for cluster to be ready
ibmcloud ks cluster get --cluster crozz-coin-free

# Configure kubectl
ibmcloud ks cluster config --cluster crozz-coin-free
```

#### Step 3: Deploy Crozz Coin (Free Tier Optimized)

```bash
# Apply IBM Cloud-specific configuration
kubectl apply -f k8s/hybrid-cloud/ibm-deployment.yaml

# Deploy with single replica (for free tier)
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/base/secret.yaml

# Deploy with minimal resources
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml

# Scale to 1 replica (free tier optimization)
kubectl scale deployment crozz-backend --replicas=1 -n crozz-coin
kubectl scale deployment crozz-frontend --replicas=1 -n crozz-coin

# Apply services
kubectl apply -f k8s/base/services.yaml
```

#### Step 4: Access Your Application

```bash
# Get the public IP
ibmcloud ks workers --cluster crozz-coin-free

# Access backend
kubectl get svc crozz-backend-service -n crozz-coin

# Access frontend
kubectl get svc crozz-frontend-service -n crozz-coin
```

### IBM Cloud Free Tier Limitations

**What's Included (FREE Forever):**
- 1 worker node (2 vCPU, 4GB RAM)
- 20GB block storage
- Network egress
- Load balancer
- No expiration!

**Optimization Tips for Free Tier:**
1. **Run 1 replica** of each service instead of 3
2. **Reduce resource requests**:
   - Backend: 50m CPU, 64Mi RAM
   - Frontend: 25m CPU, 32Mi RAM
3. **Disable auto-scaling** (HPA) on free tier
4. **Use for development/testing** - perfect for long-term testing!

### Resource Configuration for IBM Cloud Free Tier

```yaml
# Optimized for IBM Cloud Free Tier
backend:
  replicas: 1  # Instead of 3
  resources:
    requests:
      cpu: 50m      # Instead of 100m
      memory: 64Mi  # Instead of 128Mi
    limits:
      cpu: 200m     # Instead of 500m
      memory: 256Mi # Instead of 512Mi

frontend:
  replicas: 1  # Instead of 3
  resources:
    requests:
      cpu: 25m     # Instead of 50m
      memory: 32Mi # Instead of 64Mi
    limits:
      cpu: 100m    # Instead of 200m
      memory: 128Mi # Instead of 256Mi
```

### Cost Comparison: IBM Cloud Free Tier vs Others

| Feature | IBM Cloud Free | AWS Free Trial | GCP Free Trial |
|---------|----------------|----------------|----------------|
| **Duration** | ✅ **Forever** | 90 days | 90 days |
| **Credits** | N/A | $300 | $300 |
| **Worker Nodes** | 1 (2vCPU/4GB) | Multiple | Multiple |
| **Storage** | 20GB | Varies | Varies |
| **Credit Card** | ❌ Not required | ✅ Required | ✅ Required |
| **After Trial** | ✅ Still free | 💰 Pay-as-you-go | 💰 Pay-as-you-go |
| **Best For** | Long-term dev/test | Production testing | Full-scale testing |

### Why IBM Cloud Free Tier is Great for You

**Perfect for:**
- ✅ Long-term development and testing
- ✅ Learning Kubernetes without costs
- ✅ Running small production workloads
- ✅ Proof-of-concept demonstrations
- ✅ Educational projects

**Important Notes:**
- Single worker node limits you to **1 replica per deployment**
- Perfect for testing the complete setup
- Can upgrade to paid tier anytime for more resources
- No surprise bills - truly free!

---

## 🎉 Bottom Line

### If You Have IBM Cloud Free Tier

**You're in luck!** You can run Crozz Coin **forever at zero cost**:

```bash
# Deploy to IBM Cloud Free Tier
ibmcloud ks cluster create classic --name crozz-coin-free --machine-type free --workers 1
kubectl apply -f k8s/hybrid-cloud/ibm-deployment.yaml
kubectl scale deployment --all --replicas=1 -n crozz-coin
```

**No expiration, no credit card, no surprise bills!**

### For Others

**You get 90 days of FREE testing** with AWS/GCP/Azure trials, plus unlimited local testing with Minikube!

**Start testing today:**
```bash
# Option 1: IBM Cloud Free Tier (FREE, unlimited) ⭐
ibmcloud ks cluster create classic --name crozz-coin-free --machine-type free

# Option 2: Local (FREE, unlimited)
minikube start
./k8s/scripts/deploy.sh production

# Option 3: Cloud Trial (FREE, 90 days)
# Sign up → Deploy → Test for 90 days at no cost
```

No upfront costs, no commitments, full production features! 🚀
