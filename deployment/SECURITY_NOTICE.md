# Security Notice - Important Information

## ⚠️ CRITICAL: TESTNET CREDENTIALS ONLY

This deployment package contains **TESTNET-ONLY** credentials that are **intentionally public** for demonstration and testing purposes.

---

## What This Means

### ✅ Safe for Testnet
- These credentials are **specifically generated for Sui testnet**
- They have **NO REAL VALUE**
- They are **safe to share** within testnet context
- They are **intended for testing only**

### ❌ NEVER Use for Mainnet
- **DO NOT** use these addresses on Sui mainnet
- **DO NOT** use these private keys in production
- **DO NOT** reuse these credentials for anything with real value
- **DO NOT** follow this pattern for production deployments

---

## Files Containing Test Credentials

The following files contain TESTNET credentials that should **NEVER** be used in production:

1. **`wallet-admin.txt`** - Admin wallet private key
2. **`wallet-alice.txt`** - Alice test wallet private key
3. **`wallet-bob.txt`** - Bob test wallet private key
4. **`wallet-charlie.txt`** - Charlie test wallet private key
5. **`DEPLOYMENT_GUIDE.md`** - Contains wallet addresses and private keys
6. **`EXECUTION_INSTRUCTIONS.md`** - Contains wallet credentials
7. **`execute-deployment.sh`** - Contains wallet addresses
8. **`backend/scripts/deploy-and-test.js`** - Contains hardcoded credentials

---

## Security Best Practices for Production

### 1. Key Generation
- ✅ Generate fresh keys for every production deployment
- ✅ Use secure random number generators
- ✅ Never reuse keys from examples or tutorials
- ✅ Use hardware wallets for high-value accounts

### 2. Key Storage
- ✅ Use environment variables
- ✅ Use secure key management services (AWS KMS, Azure Key Vault, etc.)
- ✅ Encrypt keys at rest
- ✅ Never commit keys to version control
- ✅ Use `.gitignore` to exclude sensitive files

### 3. Key Usage
- ✅ Implement principle of least privilege
- ✅ Use separate keys for different purposes
- ✅ Rotate keys regularly
- ✅ Monitor for unauthorized access
- ✅ Implement multi-signature for high-value operations

### 4. Documentation
- ✅ Use placeholder values (e.g., `<YOUR_PRIVATE_KEY>`)
- ✅ Reference secure storage methods
- ✅ Never include real credentials in documentation
- ✅ Provide security warnings prominently

---

## Example: Production-Safe Documentation

### ❌ BAD - Never Do This in Production
```bash
# DON'T: Hardcode private keys
PRIVATE_KEY="ed25519:AAA...real_key_here"
```

### ✅ GOOD - Production Best Practice
```bash
# DO: Use environment variables
PRIVATE_KEY="${SUI_ADMIN_PRIVATE_KEY}"

# Or load from secure key management
PRIVATE_KEY=$(aws secretsmanager get-secret-value --secret-id sui-admin-key)
```

---

## Why Are Test Keys Public in This Repository?

This is a **demonstration and tutorial project** for Sui testnet deployment. The credentials are:

1. **Deliberately public** - For educational purposes
2. **Testnet only** - No real value at risk
3. **Documented as examples** - To show complete workflows
4. **Clearly marked** - With security warnings throughout

The goal is to provide a **complete, runnable example** that developers can learn from, while emphasizing that **production deployments must follow different security practices**.

---

## Mainnet Deployment Checklist

Before deploying to mainnet, ensure:

- [ ] All keys are newly generated (not from examples)
- [ ] Private keys are stored securely (not in code/docs)
- [ ] Environment variables or key vaults are used
- [ ] `.gitignore` excludes all sensitive files
- [ ] No credentials are committed to version control
- [ ] Access controls are properly configured
- [ ] Multi-signature is enabled for treasury operations
- [ ] Regular security audits are scheduled
- [ ] Incident response plan is in place
- [ ] Key rotation procedures are documented

---

## If You Suspect a Security Issue

### For This Testnet Project
Since these are public testnet credentials with no value, there's no security risk. However:
- Understand why testnet and mainnet are different
- Learn proper key management practices
- Never reuse these patterns for mainnet

### For Production Deployments
If you believe a production key may be compromised:

1. **Immediately rotate the key**
2. **Transfer assets to new secure address**
3. **Revoke compromised credentials**
4. **Audit all transactions**
5. **Update security procedures**
6. **Document the incident**

---

## Additional Resources

### Sui Security Documentation
- Official Sui Security Best Practices: https://docs.sui.io/
- Move Security Guidelines: https://move-book.com/

### General Blockchain Security
- OWASP Blockchain Security: https://owasp.org/
- Web3 Security Resources: https://github.com/securing/SCSVS

### Key Management
- Cloud Key Management:
  - AWS KMS: https://aws.amazon.com/kms/
  - Azure Key Vault: https://azure.microsoft.com/en-us/products/key-vault/
  - Google Cloud KMS: https://cloud.google.com/security-key-management

---

## Summary

| Aspect | Testnet (This Project) | Mainnet (Production) |
|--------|----------------------|---------------------|
| **Key Visibility** | Public in docs | Private, never shared |
| **Key Storage** | Files, scripts | Env vars, key vaults |
| **Key Reuse** | Acceptable | Never |
| **Value at Risk** | None (test tokens) | Real assets |
| **Security Level** | Educational | Critical |

---

**Remember**: The security practices shown in this testnet deployment are **intentionally simplified for education**. Production deployments require **professional-grade security measures**.

---

**Last Updated**: 2025-11-22  
**Network**: Sui Testnet  
**Purpose**: Educational/Testing Only
