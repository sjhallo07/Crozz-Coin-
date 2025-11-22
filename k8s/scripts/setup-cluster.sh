#!/bin/bash
set -euo pipefail

# Crozz Coin - Kubernetes Cluster Setup Script
# This script sets up a complete Kubernetes cluster with all dependencies

NAMESPACE="crozz-coin"
MONITORING_NAMESPACE="monitoring"
INGRESS_NAMESPACE="ingress-nginx"

echo "🚀 Starting Crozz Coin Kubernetes Setup..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
for cmd in kubectl helm; do
    if ! command_exists "$cmd"; then
        echo "❌ Error: $cmd is not installed"
        exit 1
    fi
done
echo "✅ Prerequisites check passed"

# Install cert-manager
echo "📜 Installing cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=300s
echo "✅ cert-manager installed"

# Install nginx-ingress
echo "🌐 Installing nginx-ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.0/deploy/static/provider/cloud/deploy.yaml
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=controller -n $INGRESS_NAMESPACE --timeout=300s
echo "✅ nginx-ingress installed"

# Install sealed-secrets
echo "🔒 Installing sealed-secrets..."
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
kubectl wait --for=condition=ready pod -l name=sealed-secrets-controller -n kube-system --timeout=300s
echo "✅ sealed-secrets installed"

# Install metrics-server
echo "📊 Installing metrics-server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
sleep 30
echo "✅ metrics-server installed"

# Install prometheus-stack
echo "📈 Installing prometheus-stack..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
    --namespace $MONITORING_NAMESPACE \
    --create-namespace \
    --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
    --wait
echo "✅ prometheus-stack installed"

# Create namespace
echo "📦 Creating application namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace $NAMESPACE pod-security.kubernetes.io/enforce=restricted --overwrite
echo "✅ Namespace created"

# Apply base manifests
echo "🔧 Applying base configurations..."
kubectl apply -f k8s/base/configmap.yaml
echo "⚠️  Please configure secrets before continuing"
echo "   Run: ./k8s/scripts/create-secrets.sh"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure secrets: ./k8s/scripts/create-secrets.sh"
echo "2. Deploy application: kubectl apply -f k8s/base/"
echo "3. Check status: kubectl get all -n $NAMESPACE"
echo ""
echo "Access Grafana:"
echo "  kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
echo "  Username: admin"
echo "  Password: prom-operator"
