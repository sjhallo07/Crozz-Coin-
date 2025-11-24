import { authMiddleware } from '../../middleware/auth.js';

describe('authMiddleware', () => {
  let req, res, next;

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

    // Set up test admin token
    process.env.ADMIN_TOKEN = 'test-admin-token-123';
  });

  describe('Authentication Success', () => {
    it('should call next() when valid Bearer token is provided', () => {
      req.headers.authorization = 'Bearer test-admin-token-123';

      authMiddleware(req, res, () => next.call());

      expect(next.callCount).toBe(1);
      expect(res.statusCode).toBeNull();
      expect(res.jsonData).toBeNull();
    });

    it('should handle token without Bearer prefix', () => {
      req.headers.authorization = 'test-admin-token-123';

      authMiddleware(req, res, () => next.call());

      // This should fail because we replace "Bearer " and it won't match
      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });
  });

  describe('Authentication Failure', () => {
    it('should return 401 when no authorization header is provided', () => {
      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });

    it('should return 401 when authorization header is empty', () => {
      req.headers.authorization = '';

      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });

    it('should return 401 when token does not match', () => {
      req.headers.authorization = 'Bearer wrong-token';

      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });

    it('should return 401 when Bearer token is malformed', () => {
      req.headers.authorization = 'Bearer';

      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });

    it('should return 401 when token has extra spaces', () => {
      req.headers.authorization = 'Bearer  test-admin-token-123 ';

      authMiddleware(req, res, () => next.call());

      // Extra spaces will cause mismatch
      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return 401 when ADMIN_TOKEN env var is not set', () => {
      delete process.env.ADMIN_TOKEN;
      req.headers.authorization = 'Bearer any-token';

      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });

    it('should handle undefined authorization header', () => {
      req.headers = {};

      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });

    it('should be case-sensitive for token comparison', () => {
      req.headers.authorization = 'Bearer TEST-ADMIN-TOKEN-123';

      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });

    it("should handle authorization header with only 'Bearer '", () => {
      req.headers.authorization = 'Bearer ';

      authMiddleware(req, res, () => next.call());

      expect(res.statusCode).toBe(401);
      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
      expect(next.called).toBe(false);
    });
  });

  describe('Response Format', () => {
    it('should return JSON response with error property', () => {
      req.headers.authorization = 'Bearer wrong-token';

      authMiddleware(req, res, () => next.call());

      expect(res.jsonData).toEqual({ error: 'Unauthorized' });
    });

    it('should use 401 status code for all failures', () => {
      const testCases = [
        { authorization: undefined },
        { authorization: '' },
        { authorization: 'Bearer wrong-token' },
        { authorization: 'InvalidFormat' },
      ];

      testCases.forEach((headers) => {
        req.headers = headers;
        res.statusCode = null;
        res.jsonData = null;

        authMiddleware(req, res, () => next.call());

        expect(res.statusCode).toBe(401);
      });
    });
  });

  describe('Integration with Express', () => {
    it('should work correctly in an Express middleware chain', () => {
      const m1Called = { called: false };
      const m3Called = { called: false };
      const middleware1 = (req, res, next) => {
        m1Called.called = true;
        next();
      };
      const middleware2 = authMiddleware;
      const middleware3 = (req, res, next) => {
        m3Called.called = true;
        next();
      };

      req.headers.authorization = 'Bearer test-admin-token-123';

      middleware1(req, res, () => {
        middleware2(req, res, () => {
          middleware3(req, res, () => next.call());
        });
      });

      expect(m1Called.called).toBe(true);
      expect(m3Called.called).toBe(true);
      expect(next.called).toBe(true);
    });

    it('should stop middleware chain on auth failure', () => {
      const m1Called = { called: false };
      const m3Called = { called: false };
      const middleware1 = (req, res, next) => {
        m1Called.called = true;
        next();
      };
      const middleware2 = authMiddleware;
      const middleware3 = (req, res, next) => {
        m3Called.called = true;
        next();
      };

      req.headers.authorization = 'Bearer wrong-token';

      middleware1(req, res, () => {
        middleware2(req, res, () => {
          middleware3(req, res, () => next.call());
        });
      });

      expect(m1Called.called).toBe(true);
      expect(m3Called.called).toBe(false);
      expect(next.called).toBe(false);
      expect(res.statusCode).toBe(401);
    });
  });
});
