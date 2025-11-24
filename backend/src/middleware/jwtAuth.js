import { authService } from '../services/AuthService.js';

export const requireAuth = ({ requireAdmin = false } = {}) => {
  return (req, res, next) => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing access token' });
    }

    const payload = authService.verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = authService.findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Account not found' });
    }

    if (requireAdmin && !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    return next();
  };
};
