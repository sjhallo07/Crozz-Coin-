# Code Security Guidelines

**Priority: Security > Functionality > Performance > Developer Experience**

This document outlines security best practices and guidelines for the Crozz-Coin project.

## Table of Contents

1. [General Security Principles](#general-security-principles)
2. [JavaScript/TypeScript Security](#javascripttypescript-security)
3. [Move Smart Contract Security](#move-smart-contract-security)
4. [API Security](#api-security)
5. [Dependency Security](#dependency-security)
6. [Secret Management](#secret-management)
7. [Security Testing](#security-testing)
8. [Security Checklist](#security-checklist)

## General Security Principles

### Defense in Depth

Always implement multiple layers of security:

1. **Input Validation**: Validate all user inputs
2. **Authentication**: Verify user identity
3. **Authorization**: Check user permissions
4. **Encryption**: Protect data in transit and at rest
5. **Logging**: Monitor and audit security events

### Least Privilege

Grant minimum necessary permissions:

```javascript
// ❌ Bad: Admin access by default
const userRole = 'admin';

// ✅ Good: User access by default, require elevation
const userRole = 'user';
```

### Fail Securely

When errors occur, fail in a secure state:

```javascript
// ❌ Bad: Exposing sensitive error details
catch (error) {
  res.status(500).json({ error: error.message, stack: error.stack });
}

// ✅ Good: Generic error message
catch (error) {
  logger.error('Transaction failed', { error, userId });
  res.status(500).json({ error: 'Transaction processing failed' });
}
```

## JavaScript/TypeScript Security

### Input Validation

Always validate and sanitize inputs:

```typescript
import { z } from 'zod';

// Define schema
const TransferSchema = z.object({
  recipient: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  amount: z.number().positive().int().max(1e18),
});

// Validate input
const validateTransfer = (data: unknown) => {
  try {
    return TransferSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid transfer data');
  }
};
```

### SQL/NoSQL Injection Prevention

Use parameterized queries:

```javascript
// ❌ Bad: SQL injection vulnerable
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ Good: Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### XSS Prevention

Sanitize outputs and use Content Security Policy:

```typescript
// Backend: Set security headers
import helmet from 'helmet';
app.use(helmet());

// Frontend: Sanitize user content
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

### CSRF Protection

Implement CSRF tokens for state-changing operations:

```javascript
// Use CSRF middleware
import csrf from 'csurf';
app.use(csrf({ cookie: true }));
```

### Secure Authentication

```typescript
// ✅ Use secure password hashing
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// ✅ Implement rate limiting
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts',
});

app.post('/auth/login', authLimiter, loginHandler);
```

### Type Safety

Leverage TypeScript's strict mode:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}

// ✅ Good: Explicit typing
interface User {
  id: string;
  address: string;
  balance: bigint;
}

const getUser = (id: string): User | null => {
  // Implementation
};

// Type-safe usage
const user = getUser(userId);
if (user) {
  // user is definitely not null here
  console.log(user.balance);
}
```

## Move Smart Contract Security

### Capability-Based Access Control

```move
// ✅ Good: Capability-based access
module crozz::token {
    struct AdminCap has key, store {
        id: UID
    }

    struct TreasuryCap has key, store {
        id: UID,
        total_supply: u64
    }

    public entry fun mint(
        cap: &TreasuryCap,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // Only holders of TreasuryCap can mint
        // ...
    }
}
```

### Error Handling

Define clear error codes:

```move
module crozz::token {
    // Error codes
    const EInsufficientBalance: u64 = 0;
    const EInvalidAmount: u64 = 1;
    const EFrozenAccount: u64 = 2;
    const EUnauthorized: u64 = 3;

    public fun transfer(/* params */) {
        assert!(balance >= amount, EInsufficientBalance);
        assert!(amount > 0, EInvalidAmount);
        assert!(!is_frozen(sender), EFrozenAccount);
        // ...
    }
}
```

### Input Validation

```move
public entry fun mint(
    cap: &TreasuryCap,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext
) {
    // Validate inputs
    assert!(amount > 0, EInvalidAmount);
    assert!(amount <= MAX_MINT_AMOUNT, EExceedsMaxMint);
    assert!(recipient != @0x0, EInvalidRecipient);

    // Proceed with minting
    // ...
}
```

### Prevent Integer Overflow

```move
// ✅ Use checked arithmetic
use sui::math;

public fun add_balance(balance: u64, amount: u64): u64 {
    // This will abort on overflow
    balance + amount
}

// Or explicit checks
public fun safe_add(a: u64, b: u64): u64 {
    let result = a + b;
    assert!(result >= a && result >= b, EOverflow);
    result
}
```

### State Management

```move
// ✅ Use proper state management
module crozz::registry {
    struct Registry has key {
        id: UID,
        frozen: bool,
        admin: address
    }

    // Check state before operations
    public fun register(registry: &mut Registry, /* params */) {
        assert!(!registry.frozen, ERegistryFrozen);
        // ...
    }
}
```

## API Security

### Authentication

```typescript
// JWT validation middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Strict limiter for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.post('/api/admin/*', strictLimiter, adminAuth, handler);
```

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### Request Validation

```typescript
// Validation middleware
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

// Usage
app.post('/api/transfer', validateRequest(TransferSchema), transferHandler);
```

## Dependency Security

### Regular Audits

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (use with caution)
npm audit fix --force
```

### Dependency Pinning

```json
// package.json - Use exact versions for production
{
  "dependencies": {
    "express": "4.19.2", // Exact version
    "@mysten/sui": "1.45.0"
  }
}
```

### Automated Scanning

Use tools in CI/CD:

```yaml
# .github/workflows/security-scan.yml
- name: Run security audit
  run: npm audit --audit-level=moderate

- name: Dependency Review
  uses: actions/dependency-review-action@v4
```

## Secret Management

### Environment Variables

```bash
# ✅ Good: Use environment variables
export SUI_ADMIN_PRIVATE_KEY="0x..."
export JWT_SECRET="random_secure_string"

# ❌ Bad: Hardcoded secrets
const privateKey = "0x123..."; // Never do this!
```

### .env File Security

```bash
# .gitignore - Always ignore .env
.env
.env.*
!.env.example

# Secrets and keys
*.key
*.pem
*.p12
secrets/
```

### Secret Rotation

Regularly rotate sensitive credentials:

1. Generate new credentials
2. Update systems with new credentials
3. Verify new credentials work
4. Revoke old credentials
5. Monitor for unauthorized access

## Security Testing

### Unit Tests

```typescript
// Test authentication
describe('Authentication', () => {
  it('should reject invalid tokens', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(403);
  });

  it('should accept valid tokens', async () => {
    const token = generateValidToken();
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
```

### Integration Tests

```typescript
// Test security flows
describe('Token Transfer Security', () => {
  it('should prevent unauthorized transfers', async () => {
    const response = await request(app).post('/api/transfer').send({
      recipient: '0x123...',
      amount: 1000,
    });

    expect(response.status).toBe(401);
  });

  it('should validate transfer amounts', async () => {
    const response = await authenticatedRequest(app).post('/api/transfer').send({
      recipient: '0x123...',
      amount: -100, // Negative amount
    });

    expect(response.status).toBe(400);
  });
});
```

### Move Tests

```move
#[test]
fun test_unauthorized_mint() {
    let ctx = tx_context::dummy();

    // This should abort with EUnauthorized
    // because we're not passing a valid TreasuryCap
    mint(1000, @0x1, &mut ctx);
}

#[test]
#[expected_failure(abort_code = EInsufficientBalance)]
fun test_transfer_insufficient_balance() {
    // Setup
    let ctx = tx_context::dummy();
    let coin = create_coin(100, &mut ctx);

    // Try to transfer more than balance
    transfer(&mut coin, 200, @0x1);
}
```

## Security Checklist

### Before Every Commit

- [ ] No secrets or API keys in code
- [ ] Input validation for all user inputs
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies are up to date
- [ ] Linting passes (including security rules)
- [ ] Tests pass

### Before Every PR

- [ ] Security audit passes (`npm run security:check`)
- [ ] No high-severity vulnerabilities
- [ ] Code review completed
- [ ] All tests pass
- [ ] Documentation updated

### Before Testnet Deployment

- [ ] Comprehensive security audit
- [ ] All Move tests pass
- [ ] Manual testing completed
- [ ] Gas optimization review
- [ ] Error handling verified
- [ ] Logging and monitoring set up

### Before Mainnet Deployment

- [ ] Professional security audit completed
- [ ] Penetration testing done
- [ ] Bug bounty program considered
- [ ] Incident response plan ready
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested
- [ ] Rate limiting configured
- [ ] DDoS protection enabled

## Resources

### Security Tools

- **npm audit**: Built-in vulnerability scanner
- **Snyk**: Dependency vulnerability scanning
- **ESLint Security Plugin**: Static analysis for JavaScript
- **OWASP ZAP**: Web application security testing
- **TruffleHog**: Secret scanning

### Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Sui Security Best Practices](https://docs.sui.io/build/secure)
- [Move Language Security](https://move-book.com/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@crozzcoin.example (replace with actual contact)
3. Provide detailed description
4. Wait for acknowledgment before disclosure

---

**Remember**: Security is everyone's responsibility. When in doubt, choose the more secure option.

_Last Updated: 2025-11-24_
