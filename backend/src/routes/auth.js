import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/jwtAuth.js';
import { authService } from '../services/AuthService.js';

const router = Router();

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch((error) => {
    console.error('[auth-route]', error);
    const isZodError = error instanceof z.ZodError;
    const status = isZodError ? 422 : error instanceof Error ? 400 : 500;
    const payload = {
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
    if (isZodError) {
      payload.details = error.issues;
    }
    res.status(status).json(payload);
  });

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

const emailSchema = z.object({
  email: z.string().email(),
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body ?? {});
    const session = await authService.register(payload);
    res.status(201).json(session);
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body ?? {});
    const session = await authService.login(payload);
    res.json(session);
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body ?? {});
    const session = await authService.refresh(payload.refreshToken);
    res.json(session);
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body ?? {});
    const result = await authService.logout(payload.refreshToken);
    res.json(result);
  })
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const payload = emailSchema.parse(req.body ?? {});
    await authService.forgotPassword(payload.email);
    res.json({ sent: true });
  })
);

router.post(
  '/forgot-username',
  asyncHandler(async (req, res) => {
    const payload = emailSchema.parse(req.body ?? {});
    await authService.forgotUsername(payload.email);
    res.json({ sent: true });
  })
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const payload = resetSchema.parse(req.body ?? {});
    const session = await authService.resetPassword(payload.token, payload.password);
    res.json(session);
  })
);

router.get(
  '/me',
  requireAuth(),
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
