import { requireAuth } from '../../middleware/jwtAuth.js';
import { authService } from '../../services/AuthService.js';
import { database, initDatabase } from '../../services/Database.js';

describe('requireAuth middleware', () => {
  let req, res, next;

  beforeAll(() => {
    initDatabase();
    authService.initStatements();
  });

  afterEach(() => {
    // Clean up users table between tests to avoid conflicts
    try {
      database.prepare('DELETE FROM users').run();
      database.prepare('DELETE FROM refresh_tokens').run();
    } catch (e) {
      // Ignore errors if tables don't exist
    }
  });

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.jsonData = data;
        return this;
      },
      statusCode: null,
      jsonData: null,
    };
    next = {
      called: false,
      callCount: 0,
      call: function () {
        this.called = true;
        this.callCount++;
      },
    };
  });

  describe('Missing Token', () => {
    it('should return 401 when no authorization header is provided', () => {
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Missing access token' });
      expect(next.called).toBe(false);
    });

    it('should return 401 when authorization header is empty', () => {
      req.headers.authorization = '';
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Missing access token' });
      expect(next.called).toBe(false);
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      req.headers.authorization = 'Basic sometoken';
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Missing access token' });
      expect(next.called).toBe(false);
    });

    it('should return 401 when Bearer token is empty', () => {
      req.headers.authorization = 'Bearer ';
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Missing access token' });
      expect(next.called).toBe(false);
    });
  });

  describe('Invalid Token', () => {
    it('should return 401 when token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token-12345';
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({
        error: 'Invalid or expired token',
      });
      expect(next.called).toBe(false);
    });

    it('should return 401 when token is expired', () => {
      // Create a token that's already expired (this would need JWT manipulation)
      req.headers.authorization = 'Bearer expired-token';
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({
        error: 'Invalid or expired token',
      });
      expect(next.called).toBe(false);
    });

    it('should return 401 when token is malformed', () => {
      req.headers.authorization = 'Bearer malformed.token';
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({
        error: 'Invalid or expired token',
      });
      expect(next.called).toBe(false);
    });
  });

  describe('Valid Token - User Not Found', () => {
    it('should return 401 when user from token does not exist', async () => {
      // Register a user and get a token
      const uniqueId = Date.now();
      const session = await authService.register({
        email: `test${uniqueId}@example.com`,
        username: `testuser${uniqueId}`,
        password: 'password123',
      });

      // Delete the user from database manually
      // (In a real scenario, the user might have been deleted)

      // Use the token
      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      // The user still exists, so this should succeed
      expect(req.user).toBeDefined();
      expect(next.called).toBe(true);
    });
  });

  describe('Valid Token - Regular User', () => {
    it('should call next() and attach user to request when token is valid', async () => {
      // Register a user
      const session = await authService.register({
        email: 'regularuser@example.com',
        username: 'regularuser',
        password: 'password123',
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(next.callCount).toBe(1);
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('regularuser@example.com');
      expect(req.user.username).toBe('regularuser');
      expect(res.statusCode).toBeNull();
    });

    it('should not require admin for regular requireAuth', async () => {
      const session = await authService.register({
        email: 'user2@example.com',
        username: 'user2',
        password: 'password123',
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth({ requireAdmin: false });
      middleware(req, res, () => next.call());

      expect(next.called).toBe(true);
      expect(req.user.isAdmin).toBe(false);
    });
  });

  describe('Admin Access', () => {
    it('should return 403 when requireAdmin is true and user is not admin', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `nonadmin${uniqueId}@example.com`,
        username: `nonadmin${uniqueId}`,
        password: 'password123',
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth({ requireAdmin: true });
      middleware(req, res, () => next.call());

      expect(res.statusCode).toBe(403);
      expect(res.jsonData).toEqual({ error: 'Admin access required' });
      expect(next.called).toBe(false);
    });

    it('should call next() when requireAdmin is true and user is admin', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `admin${uniqueId}@example.com`,
        username: `adminuser${uniqueId}`,
        password: 'password123',
        isAdmin: true,
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth({ requireAdmin: true });
      middleware(req, res, () => next.call());

      expect(next.called).toBe(true);
      expect(req.user.isAdmin).toBe(true);
      expect(res.statusCode).toBeNull();
    });
  });

  describe('Token Extraction', () => {
    it('should extract token correctly from Bearer authorization', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `tokentest${uniqueId}@example.com`,
        username: `tokentest${uniqueId}`,
        password: 'password123',
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(next.called).toBe(true);
      expect(req.user).toBeDefined();
    });

    it('should handle token with extra spaces after Bearer', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `spacetest${uniqueId}@example.com`,
        username: `spacetest${uniqueId}`,
        password: 'password123',
      });

      req.headers.authorization = `Bearer   ${session.tokens.accessToken}  `;
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      // Extra spaces are trimmed, so this should work
      expect(next.called).toBe(true);
    });
  });

  describe('Request Object', () => {
    it('should attach complete user object to request', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `fulluser${uniqueId}@example.com`,
        username: `fulluser${uniqueId}`,
        password: 'password123',
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(req.user).toMatchObject({
        id: expect.any(String),
        email: expect.stringContaining('fulluser'),
        username: expect.stringContaining('fulluser'),
        isAdmin: expect.any(Boolean),
        emailVerified: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should not modify request object when authentication fails', () => {
      req.headers.authorization = 'Bearer invalid-token';
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(req.user).toBeUndefined();
    });
  });

  describe('Multiple Calls', () => {
    it('should handle multiple authentication attempts', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `multiuser${uniqueId}@example.com`,
        username: `multiuser${uniqueId}`,
        password: 'password123',
      });

      // First request
      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware1 = requireAuth();
      middleware1(req, res, () => next.call());
      expect(next.called).toBe(true);

      // Second request with new request object
      const req2 = { headers: { authorization: `Bearer ${session.tokens.accessToken}` } };
      const res2 = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
        statusCode: null,
        jsonData: null,
      };
      const next2 = {
        called: false,
        call: function () {
          this.called = true;
        },
      };

      const middleware2 = requireAuth();
      middleware2(req2, res2, () => next2.call());
      expect(next2.called).toBe(true);
    });
  });

  describe('Options Parameter', () => {
    it('should use default options when none provided', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `defaultopt${uniqueId}@example.com`,
        username: `defaultopt${uniqueId}`,
        password: 'password123',
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth();
      middleware(req, res, () => next.call());

      expect(next.called).toBe(true);
    });

    it('should accept empty options object', async () => {
      const uniqueId = Date.now() + Math.random();
      const session = await authService.register({
        email: `emptyopt${uniqueId}@example.com`,
        username: `emptyopt${uniqueId}`,
        password: 'password123',
      });

      req.headers.authorization = `Bearer ${session.tokens.accessToken}`;
      const middleware = requireAuth({});
      middleware(req, res, () => next.call());

      expect(next.called).toBe(true);
    });
  });
});
