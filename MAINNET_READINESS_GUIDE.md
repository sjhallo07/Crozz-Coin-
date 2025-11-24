# Mainnet Readiness Guide

**Status:** 📋 Pre-Launch Checklist  
**Current Network:** Testnet  
**Target Network:** Mainnet

---

## ⚠️ Critical Warning

**DO NOT deploy to mainnet until ALL items in this guide are completed and verified.**

Mainnet deployment involves real assets with real value. Mistakes can result in:

- Permanent loss of funds
- Security vulnerabilities exposing user assets
- Irreversible smart contract bugs
- Legal and regulatory consequences

---

## Table of Contents

1. [Pre-Deployment Validation](#pre-deployment-validation)
2. [Security Audit Requirements](#security-audit-requirements)
3. [Configuration Changes](#configuration-changes)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Operations](#monitoring--operations)
7. [Incident Response](#incident-response)

---

## Pre-Deployment Validation

### 1. Run Comprehensive Testnet Tests

```bash
# Run the testnet validation script
./scripts/testnet-validation.sh

# Review the generated report
cat TESTNET_VALIDATION_REPORT.md
```

**Requirements:**

- ✅ All automated tests must pass
- ✅ Manual testing of all critical functions completed
- ✅ Edge cases and error scenarios tested
- ✅ Load testing completed successfully
- ✅ No known bugs or issues

### 2. Code Review

**Requirements:**

- ✅ Complete code review by senior developers
- ✅ All code follows security best practices
- ✅ No hardcoded secrets or credentials
- ✅ Proper error handling throughout
- ✅ Input validation on all user inputs
- ✅ Rate limiting implemented
- ✅ CORS properly configured

### 3. Smart Contract Verification

**Requirements:**

- ✅ Move contract follows best practices
- ✅ No overflow/underflow vulnerabilities
- ✅ Proper access control on admin functions
- ✅ Events emitted for all state changes
- ✅ Gas optimization completed
- ✅ Upgrade path considered (if applicable)

---

## Security Audit Requirements

### Professional Security Audit

**MANDATORY:** Have the smart contract audited by a reputable security firm before mainnet deployment.

**Recommended Audit Firms:**

- Trail of Bits
- ConsenSys Diligence
- OpenZeppelin
- CertiK
- Halborn

**Audit Scope Must Include:**

- ✅ Smart contract security review
- ✅ Access control verification
- ✅ Economic security analysis
- ✅ Reentrancy attack prevention
- ✅ Front-running protection
- ✅ Integer overflow/underflow checks
- ✅ Denial of service attack prevention

### Internal Security Checklist

- [ ] All dependencies are up-to-date
- [ ] No known vulnerabilities in dependencies
- [ ] Secrets stored securely (never in code)
- [ ] Private keys managed with hardware security modules (HSM)
- [ ] Multi-signature wallet for treasury operations
- [ ] Admin operations require multiple approvals
- [ ] Rate limiting on all API endpoints
- [ ] SQL injection prevention verified
- [ ] Cross-site scripting (XSS) prevention verified
- [ ] CSRF protection enabled

---

## Configuration Changes

### Environment Variables - Mainnet

Create new environment files for mainnet (NEVER reuse testnet values):

#### Backend `.env` (Mainnet)

```env
# Network
NODE_ENV=production
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
VITE_SUI_NETWORK=mainnet

# Security - GENERATE NEW VALUES
ADMIN_TOKEN=<GENERATE_STRONG_RANDOM_TOKEN_32_CHARS_MIN>
JWT_SECRET=<GENERATE_STRONG_RANDOM_SECRET_64_CHARS_MIN>
JWT_ISSUER=crozz-mainnet-auth
BCRYPT_SALT_ROUNDS=14

# Sui Configuration - DEPLOY NEW PACKAGE TO MAINNET
SUI_ADMIN_PRIVATE_KEY=<NEW_MAINNET_KEY_FROM_HSM>
SUI_DEFAULT_GAS_BUDGET=20000000
CROZZ_PACKAGE_ID=<MAINNET_PACKAGE_ID>
CROZZ_TREASURY_CAP_ID=<MAINNET_TREASURY_CAP>
CROZZ_ADMIN_CAP_ID=<MAINNET_ADMIN_CAP>
CROZZ_REGISTRY_ID=<MAINNET_REGISTRY_ID>
CROZZ_MODULE=crozz_token
CROZZ_EXECUTOR_DRY_RUN=false
CROZZ_DEFAULT_SIGNER=<MAINNET_MULTISIG_ADDRESS>

# API
PORT=4000
```

#### Frontend `.env` (Mainnet)

```env
VITE_SUI_NETWORK=mainnet
VITE_CROZZ_API_BASE_URL=https://api.crozz.io
VITE_CROZZ_PACKAGE_ID=<MAINNET_PACKAGE_ID>
VITE_CROZZ_MAINNET_PACKAGE_ID=<MAINNET_PACKAGE_ID>
VITE_CROZZ_METADATA_ID=<MAINNET_METADATA_ID>
VITE_CROZZ_MAINNET_METADATA_ID=<MAINNET_METADATA_ID>
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_VIEW_FUNCTION=get_icon_url
VITE_CROZZ_GAS_BUDGET=20000000
VITE_CROZZ_ADMIN_TOKEN=<MAINNET_ADMIN_TOKEN>
VITE_CROZZ_REGISTRY_ID=<MAINNET_REGISTRY_ID>
VITE_CROZZ_TREASURY_CAP_ID=<MAINNET_TREASURY_CAP>
VITE_CROZZ_ADMIN_CAP_ID=<MAINNET_ADMIN_CAP>
VITE_SUI_CLOCK_OBJECT=0x6
```

### Critical Configuration Changes

1. **Generate New Keys:**

   ```bash
   # DO NOT reuse testnet keys
   cd backend
   node scripts/setup-sui-client.js --network mainnet --update-env
   ```

2. **Use Secure Key Storage:**
   - Store private keys in AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
   - NEVER commit private keys to version control
   - Use environment variable injection in production

3. **Multi-Signature Setup:**
   - Configure multi-signature wallet for treasury management
   - Require multiple approvals for critical operations
   - Document signers and approval process

---

## Deployment Process

### Phase 1: Pre-Deployment (1-2 Weeks Before)

1. **Complete Security Audit**
   - Receive and review audit report
   - Fix all critical and high-severity issues
   - Re-audit if significant changes made

2. **Prepare Infrastructure**
   - Set up production servers with appropriate security
   - Configure monitoring and alerting
   - Set up log aggregation
   - Configure backups and disaster recovery

3. **Documentation**
   - Update all documentation for mainnet
   - Prepare user guides
   - Document operational procedures
   - Create incident response plan

### Phase 2: Deployment Day

```bash
# 1. Deploy Smart Contract to Mainnet
cd smart-contract
sui client publish --gas-budget 100000000 --skip-dependency-verification

# 2. Save deployment output
# Copy Package ID, Treasury Cap ID, Admin Cap ID, Registry ID, Metadata ID

# 3. Update mainnet environment files
# Edit .env files with mainnet IDs

# 4. Deploy Backend
# Deploy to production server with mainnet configuration

# 5. Deploy Frontend
# Build and deploy frontend with mainnet configuration
cd frontend
npm run build
# Deploy build/ to CDN or static hosting

# 6. Verify deployment
./scripts/testnet-validation.sh  # Should now run against mainnet config
```

### Phase 3: Post-Deployment (First 24 Hours)

1. **Immediate Verification**
   - Verify all endpoints responding
   - Test token metadata retrieval
   - Test view functions
   - Monitor error rates

2. **Limited Operations**
   - Start with small test transactions
   - Gradually increase transaction volume
   - Monitor gas usage and costs

3. **Team Availability**
   - Full team on standby for first 24 hours
   - Incident response team ready
   - Communication channels open

---

## Post-Deployment Verification

### Automated Checks

```bash
# Run validation against mainnet
VITE_SUI_NETWORK=mainnet ./scripts/testnet-validation.sh

# Monitor backend health
curl https://api.crozz.io/health

# Check token summary
curl https://api.crozz.io/api/tokens/summary
```

### Manual Verification Checklist

- [ ] Token metadata displays correctly
- [ ] Wallet integration works
- [ ] Mint operation works (small test amount)
- [ ] Transfer operation works
- [ ] Burn operation works
- [ ] Admin operations require proper authentication
- [ ] Rate limiting is active
- [ ] Monitoring dashboards showing data
- [ ] Alerts are configured and firing correctly
- [ ] Logs are being collected

---

## Monitoring & Operations

### Monitoring Setup

**Required Monitoring:**

1. **Application Monitoring**
   - API response times
   - Error rates
   - Transaction success/failure rates
   - WebSocket connection health

2. **Blockchain Monitoring**
   - Transaction confirmation times
   - Gas usage patterns
   - Failed transaction analysis
   - Token supply changes

3. **Infrastructure Monitoring**
   - Server CPU/Memory/Disk
   - Network latency
   - Database performance
   - SSL certificate expiration

4. **Security Monitoring**
   - Failed authentication attempts
   - Unusual transaction patterns
   - API abuse detection
   - DDoS attack detection

### Alerting Configuration

**Critical Alerts (Page Immediately):**

- Backend API down
- Smart contract interaction failures
- Security breach detected
- Treasury operations anomalies

**Warning Alerts (Notify Team):**

- High error rates
- Elevated response times
- Unusual traffic patterns
- Certificate expiration warning

### Operations Procedures

**Daily Tasks:**

- Review monitoring dashboards
- Check error logs
- Verify backup completion
- Review transaction activity

**Weekly Tasks:**

- Security audit of recent changes
- Performance optimization review
- Dependency updates (security patches)
- Disaster recovery drill

**Monthly Tasks:**

- Comprehensive security review
- Cost optimization analysis
- Capacity planning review
- Update documentation

---

## Incident Response

### Incident Response Team

**Roles:**

- Incident Commander
- Technical Lead
- Communications Lead
- Security Lead

**Contact Information:**

- [Maintain current contact list]
- [Include escalation procedures]

### Response Procedures

#### Critical Incident (Security Breach, Major Bug)

1. **Immediate Actions:**
   - Pause all operations if possible
   - Assess scope of incident
   - Activate incident response team
   - Begin documentation

2. **Investigation:**
   - Collect logs and evidence
   - Identify root cause
   - Assess impact
   - Document timeline

3. **Remediation:**
   - Implement fix
   - Test thoroughly
   - Deploy to production
   - Verify resolution

4. **Communication:**
   - Notify affected users
   - Update status page
   - Post-mortem report
   - Implement preventive measures

#### Emergency Contacts

- Security Team: [Contact]
- Legal Counsel: [Contact]
- Sui Network Support: [Contact]
- Hosting Provider: [Contact]

### Circuit Breakers

**When to Halt Operations:**

- Security vulnerability discovered
- Unexpected token supply changes
- Multiple transaction failures
- Suspected smart contract bug
- DDoS attack in progress

**Pause Procedure:**

```bash
# Set executor to dry-run mode
# This stops automatic transaction execution
export CROZZ_EXECUTOR_DRY_RUN=true
# Restart backend service
```

---

## Legal & Compliance

### Required Documentation

- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Token Use Agreement
- [ ] Risk Disclosures
- [ ] Regulatory Compliance Documentation

### Legal Review

- [ ] Legal counsel has reviewed all documentation
- [ ] Regulatory requirements understood and met
- [ ] Tax implications documented
- [ ] Intellectual property protected
- [ ] Liability protections in place

---

## Final Checklist

### Before Mainnet Deployment

- [ ] All testnet tests passing
- [ ] Security audit completed and issues resolved
- [ ] Code review completed
- [ ] New mainnet keys generated and secured
- [ ] Multi-signature wallet configured
- [ ] Infrastructure deployed and tested
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Team trained and ready
- [ ] Legal documentation complete
- [ ] User documentation ready
- [ ] Backup and disaster recovery tested
- [ ] Load testing completed successfully
- [ ] All dependencies up-to-date
- [ ] Rate limiting tested
- [ ] CORS properly configured
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Communication channels ready
- [ ] Go/No-Go meeting held and approved

### Sign-Off Required

- [ ] Technical Lead: ********\_********
- [ ] Security Lead: ********\_********
- [ ] Product Manager: ********\_********
- [ ] Legal Counsel: ********\_********
- [ ] Executive Sponsor: ********\_********

**Date:** ********\_********

---

## Resources

### Documentation

- [Sui Mainnet Documentation](https://docs.sui.io/)
- [Move Security Best Practices](https://move-book.com/)
- [Crozz Token Documentation](./README.md)

### Support

- Sui Discord: https://discord.gg/sui
- Sui Forum: https://forums.sui.io/

### Tools

- Sui Explorer: https://suiexplorer.com/
- Gas Optimization: [Best Practices]
- Security Tools: [List security scanning tools]

---

**Last Updated:** 2025-11-23  
**Version:** 1.0  
**Status:** Pre-Launch

---

**Remember:** Mainnet deployment is a one-way door. Take your time, verify everything, and don't rush. The safety and security of user funds depends on thorough preparation.
