#!/bin/bash
set -euo pipefail

# Crozz Coin - Deployment Script
# This script deploys the application to Kubernetes

NAMESPACE="crozz-coin"
ENVIRONMENT=${1:-"production"}

echo "🚀 Deploying Crozz Coin to Kubernetes"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Error: kubectl is not configured or cluster is not reachable"
    exit 1
fi

# Apply security policies first
echo "🔒 Applying security policies..."
kubectl apply -f k8s/security/

# Deploy using overlay if available
if [ -d "k8s/overlays/$ENVIRONMENT" ]; then
    echo "📦 Deploying using kustomize overlay: $ENVIRONMENT"
    kubectl apply -k k8s/overlays/$ENVIRONMENT
else
    echo "📦 Deploying base manifests..."
    kubectl apply -f k8s/base/
fi

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s \
    deployment/crozz-backend \
    deployment/crozz-frontend \
    -n $NAMESPACE

# Check pod status
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "✅ Deployment complete!"
echo ""
echo "To check the status:"
echo "  kubectl get all -n $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/crozz-backend -n $NAMESPACE"
echo "  kubectl logs -f deployment/crozz-frontend -n $NAMESPACE"
echo ""
echo "To access the application:"
echo "  kubectl port-forward -n $NAMESPACE svc/crozz-backend-service 4000:4000"
echo "  kubectl port-forward -n $NAMESPACE svc/crozz-frontend-service 8080:80"
