#!/bin/bash
set -euo pipefail

# Crozz Coin - Secrets Creation Script
# This script helps create Kubernetes secrets securely

NAMESPACE="crozz-coin"

echo "🔐 Crozz Coin - Secrets Configuration"
echo ""

# Function to prompt for secret
prompt_secret() {
    local var_name=$1
    local description=$2
    local default_value=${3:-""}
    
    echo -n "$description"
    if [ -n "$default_value" ]; then
        echo -n " [$default_value]"
    fi
    echo -n ": "
    read -s value
    echo ""
    
    if [ -z "$value" ] && [ -n "$default_value" ]; then
        value="$default_value"
    fi
    
    echo "$value"
}

echo "Please provide the following secrets:"
echo ""

# Backend secrets
echo "📦 Backend Secrets:"
SUI_ADMIN_PRIVATE_KEY=$(prompt_secret "SUI_ADMIN_PRIVATE_KEY" "Sui Admin Private Key (ed25519:...)")
ADMIN_TOKEN=$(prompt_secret "ADMIN_TOKEN" "Admin API Token" "$(openssl rand -hex 32)")
JWT_SECRET=$(prompt_secret "JWT_SECRET" "JWT Secret" "$(openssl rand -hex 32)")
CROZZ_PACKAGE_ID=$(prompt_secret "CROZZ_PACKAGE_ID" "Crozz Package ID (0x...)")
CROZZ_TREASURY_CAP_ID=$(prompt_secret "CROZZ_TREASURY_CAP_ID" "Treasury Cap ID (0x...)")
CROZZ_ADMIN_CAP_ID=$(prompt_secret "CROZZ_ADMIN_CAP_ID" "Admin Cap ID (0x...)")
CROZZ_REGISTRY_ID=$(prompt_secret "CROZZ_REGISTRY_ID" "Registry ID (0x...)")
CROZZ_METADATA_ID=$(prompt_secret "CROZZ_METADATA_ID" "Metadata ID (0x...)")
CROZZ_DEFAULT_SIGNER=$(prompt_secret "CROZZ_DEFAULT_SIGNER" "Default Signer Address (0x...)")

echo ""
echo "📦 Frontend Secrets:"
VITE_CROZZ_ADMIN_TOKEN=$ADMIN_TOKEN
VITE_CROZZ_PACKAGE_ID=$CROZZ_PACKAGE_ID
VITE_CROZZ_METADATA_ID=$CROZZ_METADATA_ID

# Create secrets
echo ""
echo "Creating secrets in namespace: $NAMESPACE"

# Backend secret
kubectl create secret generic crozz-backend-secrets \
    --namespace=$NAMESPACE \
    --from-literal=SUI_ADMIN_PRIVATE_KEY="$SUI_ADMIN_PRIVATE_KEY" \
    --from-literal=ADMIN_TOKEN="$ADMIN_TOKEN" \
    --from-literal=JWT_SECRET="$JWT_SECRET" \
    --from-literal=CROZZ_PACKAGE_ID="$CROZZ_PACKAGE_ID" \
    --from-literal=CROZZ_TREASURY_CAP_ID="$CROZZ_TREASURY_CAP_ID" \
    --from-literal=CROZZ_ADMIN_CAP_ID="$CROZZ_ADMIN_CAP_ID" \
    --from-literal=CROZZ_REGISTRY_ID="$CROZZ_REGISTRY_ID" \
    --from-literal=CROZZ_METADATA_ID="$CROZZ_METADATA_ID" \
    --from-literal=CROZZ_DEFAULT_SIGNER="$CROZZ_DEFAULT_SIGNER" \
    --dry-run=client -o yaml | kubectl apply -f -

# Frontend secret
kubectl create secret generic crozz-frontend-secrets \
    --namespace=$NAMESPACE \
    --from-literal=VITE_CROZZ_ADMIN_TOKEN="$VITE_CROZZ_ADMIN_TOKEN" \
    --from-literal=VITE_CROZZ_PACKAGE_ID="$VITE_CROZZ_PACKAGE_ID" \
    --from-literal=VITE_CROZZ_METADATA_ID="$VITE_CROZZ_METADATA_ID" \
    --from-literal=VITE_CROZZ_REGISTRY_ID="$CROZZ_REGISTRY_ID" \
    --from-literal=VITE_CROZZ_TREASURY_CAP_ID="$CROZZ_TREASURY_CAP_ID" \
    --from-literal=VITE_CROZZ_ADMIN_CAP_ID="$CROZZ_ADMIN_CAP_ID" \
    --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "✅ Secrets created successfully!"
echo ""
echo "To use Sealed Secrets (recommended for production):"
echo "1. Install kubeseal: https://github.com/bitnami-labs/sealed-secrets"
echo "2. Seal the secrets:"
echo "   kubectl get secret crozz-backend-secrets -n $NAMESPACE -o yaml | kubeseal --format=yaml > sealed-backend-secrets.yaml"
echo "   kubectl get secret crozz-frontend-secrets -n $NAMESPACE -o yaml | kubeseal --format=yaml > sealed-frontend-secrets.yaml"
echo "3. Commit sealed secrets to git (they're encrypted and safe)"
