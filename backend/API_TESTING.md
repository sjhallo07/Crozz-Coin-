# API Testing Guide

This guide explains how to test the Crozz Coin backend API endpoints.

## Quick Start

```bash
# Install dependencies
cd backend
npm install

# Run all integration tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Test Structure

The API integration tests are located in:
```
backend/src/__tests__/api.integration.test.js
```

## What's Tested

### ✅ Token Management
- Token summary retrieval
- Mint transaction enqueueing
- Burn transaction enqueueing with validation
- Distribution transaction enqueueing with validation

### ✅ Admin Operations
- Authentication requirements
- Job queue retrieval
- Configuration updates

### ✅ Sui Blockchain Proxy
- View function calls
- Parameter validation

### ✅ Events & Transactions
- Recent events retrieval

### ✅ User Authentication
- Registration with validation
- Login with validation
- Token refresh
- Logout
- Password reset flow
- Current user retrieval with JWT

## Test Categories

### 1. Happy Path Tests
Tests that verify successful API operations:
```javascript
it("should return token summary", async () => {
  const response = await request(app)
    .get("/api/tokens/summary")
    .expect(200);
  // assertions...
});
```

### 2. Validation Tests
Tests that verify input validation:
```javascript
it("should return 400 when coinId is missing", async () => {
  const response = await request(app)
    .post("/api/tokens/burn")
    .send({})
    .expect(400);
});
```

### 3. Authentication Tests
Tests that verify authentication requirements:
```javascript
it("should return 401 without auth token", async () => {
  await request(app)
    .get("/api/admin/jobs")
    .expect(401);
});
```

## Environment Setup

Tests use the `.env` file from the root directory. Key variables:
```env
ADMIN_TOKEN=change-me
JWT_SECRET=super-secret-key
NODE_ENV=development
```

## Manual API Testing

### Using curl

#### Test Token Summary
```bash
curl http://localhost:4000/api/tokens/summary
```

#### Test Mint (no auth required)
```bash
curl -X POST http://localhost:4000/api/tokens/mint \
  -H "Content-Type: application/json" \
  -d '{"amount": "1000", "recipient": "0xabc..."}'
```

#### Test Admin Jobs (auth required)
```bash
curl http://localhost:4000/api/admin/jobs \
  -H "Authorization: Bearer change-me"
```

#### Test Auth Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "password123"}'
```

### Using Postman/Insomnia

Import the following endpoints:

**Token API:**
- GET `{{baseUrl}}/api/tokens/summary`
- POST `{{baseUrl}}/api/tokens/mint`
- POST `{{baseUrl}}/api/tokens/burn`
- POST `{{baseUrl}}/api/tokens/distribute`

**Admin API (requires Authorization header):**
- GET `{{baseUrl}}/api/admin/jobs`
- POST `{{baseUrl}}/api/admin/config`

**Sui Proxy API:**
- POST `{{baseUrl}}/api/sui/token-address`

**Events API:**
- GET `{{baseUrl}}/api/events/recent`

**Auth API:**
- POST `{{baseUrl}}/api/auth/register`
- POST `{{baseUrl}}/api/auth/login`
- POST `{{baseUrl}}/api/auth/refresh`
- POST `{{baseUrl}}/api/auth/logout`
- POST `{{baseUrl}}/api/auth/forgot-password`
- POST `{{baseUrl}}/api/auth/forgot-username`
- POST `{{baseUrl}}/api/auth/reset-password`
- GET `{{baseUrl}}/api/auth/me` (requires JWT)

Variables:
- `baseUrl`: http://localhost:4000

## WebSocket Testing

### Using wscat
```bash
npm install -g wscat
wscat -c ws://localhost:4000/events
```

### Using Browser Console
```javascript
const ws = new WebSocket('ws://localhost:4000/events');
ws.onmessage = (event) => console.log('Event:', JSON.parse(event.data));
ws.onopen = () => console.log('Connected');
```

## Adding New Tests

### 1. Test a new GET endpoint
```javascript
describe("GET /api/new/endpoint", () => {
  it("should return expected data", async () => {
    const response = await request(app)
      .get("/api/new/endpoint")
      .expect(200);
    
    expect(response.body).toHaveProperty("expectedField");
  });
});
```

### 2. Test a new POST endpoint with validation
```javascript
describe("POST /api/new/endpoint", () => {
  it("should accept valid data", async () => {
    const response = await request(app)
      .post("/api/new/endpoint")
      .send({ field: "value" })
      .expect(200);
    
    expect(response.body).toHaveProperty("success", true);
  });
  
  it("should reject invalid data", async () => {
    const response = await request(app)
      .post("/api/new/endpoint")
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty("error");
  });
});
```

### 3. Test authenticated endpoints
```javascript
describe("GET /api/protected/endpoint", () => {
  it("should require authentication", async () => {
    await request(app)
      .get("/api/protected/endpoint")
      .expect(401);
  });
  
  it("should work with valid token", async () => {
    const token = process.env.ADMIN_TOKEN;
    
    const response = await request(app)
      .get("/api/protected/endpoint")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    
    expect(response.body).toHaveProperty("data");
  });
});
```

## Debugging Tests

### Run specific test
```bash
npm test -- -t "should return token summary"
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Enable verbose output
```bash
npm test -- --verbose
```

### See console logs in tests
Tests already show console output from the application, including errors.

## Common Issues

### Issue: Database not initialized
**Solution:** The test suite automatically initializes the database in `beforeAll()`.

### Issue: Environment variables not loaded
**Solution:** The test file loads `.env` from the root directory using:
```javascript
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
```

### Issue: Port already in use
**Solution:** Tests don't start a server; they use supertest which handles this internally.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run tests
        run: cd backend && npm test
        env:
          ADMIN_TOKEN: test-token
          JWT_SECRET: test-secret
          NODE_ENV: test
```

## Coverage Reports

Generate coverage report:
```bash
npm test -- --coverage
```

View HTML coverage report:
```bash
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

## Best Practices

1. ✅ **Isolate tests** - Each test should be independent
2. ✅ **Test behavior, not implementation** - Focus on API contracts
3. ✅ **Use descriptive test names** - "should do X when Y"
4. ✅ **Test both success and failure paths**
5. ✅ **Test authentication and authorization**
6. ✅ **Test input validation**
7. ✅ **Clean up test data** - Currently handled by database re-initialization

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Express Testing Guide](https://expressjs.com/en/guide/testing.html)

---

Last Updated: November 22, 2025
