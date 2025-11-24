import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { database } from './Database.js';
import { emailService } from './EmailService.js';

const nowIso = () => new Date().toISOString();
const minutes = (value) => value * 60 * 1000;
const days = (value) => value * 24 * 60 * 60 * 1000;

class AuthService {
  constructor() {
    if (process.env.JWT_SECRET) {
      this.jwtSecret = process.env.JWT_SECRET;
    } else {
      // For development, generate a strong random secret if not provided, but warn the user.
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[AuthService] Warning: JWT_SECRET is not set. Generating a random secret for this session. ' +
            'All tokens will be invalid after server restart. Set JWT_SECRET in your .env for persistent sessions.'
        );
        this.jwtSecret = randomBytes(64).toString('hex');
      } else {
        throw new Error(
          'JWT_SECRET environment variable is required in production and test environments'
        );
      }
    }
    this.jwtIssuer = process.env.JWT_ISSUER ?? 'crozz-auth';
    this.accessTtlMs = Number(process.env.JWT_ACCESS_TTL_MS ?? minutes(15));
    this.refreshTtlMs = Number(process.env.JWT_REFRESH_TTL_MS ?? days(30));
    this.resetTtlMs = Number(process.env.PASSWORD_RESET_TTL_MS ?? minutes(15));
    this.bcryptRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

    // Prepared statements will be initialized after database is ready
    this.insertUserStmt = null;
    this.findUserByEmailStmt = null;
    this.findUserByUsernameStmt = null;
    this.findUserByIdStmt = null;
    this.updateUserPasswordStmt = null;
    this.updateLastLoginStmt = null;
    this.insertRefreshTokenStmt = null;
    this.findRefreshTokenStmt = null;
    this.revokeRefreshTokenStmt = null;
    this.insertPasswordResetStmt = null;
    this.findPasswordResetStmt = null;
    this.markPasswordResetUsedStmt = null;
  }

  // Call this after the database is initialized
  initStatements() {
    this.insertUserStmt = database.prepare(`
      INSERT INTO users (
        id, email, username, password_hash, is_admin, email_verified,
        last_login_at, created_at, updated_at
      ) VALUES (
        @id, @email, @username, @password_hash, @is_admin, @email_verified,
        @last_login_at, @created_at, @updated_at
      )
    `);

    this.findUserByEmailStmt = database.prepare(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(@email)`
    );

    this.findUserByUsernameStmt = database.prepare(
      `SELECT * FROM users WHERE LOWER(username) = LOWER(@username)`
    );

    this.findUserByIdStmt = database.prepare(`SELECT * FROM users WHERE id = @id`);

    this.updateUserPasswordStmt = database.prepare(`
      UPDATE users
      SET password_hash = @password_hash, updated_at = @updated_at
      WHERE id = @id
    `);

    this.updateLastLoginStmt = database.prepare(`
      UPDATE users SET last_login_at = @last_login_at WHERE id = @id
    `);

    this.insertRefreshTokenStmt = database.prepare(`
      INSERT INTO refresh_tokens (
        id, user_id, token, expires_at, revoked_at, created_at
      ) VALUES (
        @id, @user_id, @token, @expires_at, NULL, @created_at
      )
    `);

    this.findRefreshTokenStmt = database.prepare(
      `SELECT * FROM refresh_tokens WHERE token = @token`
    );

    this.revokeRefreshTokenStmt = database.prepare(`
      UPDATE refresh_tokens
      SET revoked_at = @revoked_at
      WHERE id = @id
    `);

    this.insertPasswordResetStmt = database.prepare(`
      INSERT INTO password_resets (
        id, user_id, token, expires_at, used_at, created_at
      ) VALUES (
        @id, @user_id, @token, @expires_at, NULL, @created_at
      )
    `);

    this.findPasswordResetStmt = database.prepare(
      `SELECT * FROM password_resets WHERE token = @token`
    );

    this.markPasswordResetUsedStmt = database.prepare(`
      UPDATE password_resets
      SET used_at = @used_at
      WHERE id = @id
    `);
  }

  async register({ email, username, password, isAdmin = false }) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();
    this.#assertPresent(normalizedEmail, 'Email is required');
    this.#assertPresent(normalizedUsername, 'Username is required');
    this.#assertPresent(password, 'Password is required');

    if (this.#getUserRowByEmail(normalizedEmail)) {
      throw new Error('Email already registered');
    }

    if (this.#getUserRowByUsername(normalizedUsername)) {
      throw new Error('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);
    const now = nowIso();
    const userRecord = {
      id: randomUUID(),
      email: normalizedEmail,
      username: normalizedUsername,
      password_hash: passwordHash,
      is_admin: isAdmin ? 1 : 0,
      email_verified: 0,
      last_login_at: now,
      created_at: now,
      updated_at: now,
    };

    this.insertUserStmt.run(userRecord);
    return this.#issueSession(this.#publicUser(userRecord));
  }

  async login({ identifier, password }) {
    this.#assertPresent(identifier, 'Email or username is required');
    this.#assertPresent(password, 'Password is required');

    const row = this.#getUserRowByEmail(identifier) ?? this.#getUserRowByUsername(identifier);

    if (!row) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    this.updateLastLoginStmt.run({ id: row.id, last_login_at: nowIso() });
    return this.#issueSession(this.#publicUser(row));
  }

  async refresh(refreshToken) {
    this.#assertPresent(refreshToken, 'Refresh token is required');
    const hashed = this.#hashToken(refreshToken);
    const record = this.findRefreshTokenStmt.get({ token: hashed });
    if (!record || record.revoked_at) {
      throw new Error('Refresh token invalid');
    }

    if (record.expires_at < Date.now()) {
      await this.revokeRefreshTokenStmt.run({
        id: record.id,
        revoked_at: Date.now(),
      });
      throw new Error('Refresh token expired');
    }

    const user = this.#getUserRowById(record.user_id);
    if (!user) {
      throw new Error('Account missing');
    }

    await this.revokeRefreshTokenStmt.run({
      id: record.id,
      revoked_at: Date.now(),
    });

    return this.#issueSession(this.#publicUser(user));
  }

  async logout(refreshToken) {
    if (!refreshToken) return { revoked: false };
    const hashed = this.#hashToken(refreshToken);
    const record = this.findRefreshTokenStmt.get({ token: hashed });
    if (!record || record.revoked_at) {
      return { revoked: false };
    }
    this.revokeRefreshTokenStmt.run({ id: record.id, revoked_at: Date.now() });
    return { revoked: true };
  }

  async forgotPassword(email) {
    this.#assertPresent(email, 'Email is required');
    const user = this.#getUserRowByEmail(email);
    if (!user) {
      return { sent: true };
    }

    const token = this.#randomToken();
    this.insertPasswordResetStmt.run({
      id: randomUUID(),
      user_id: user.id,
      token: this.#hashToken(token),
      expires_at: Date.now() + this.resetTtlMs,
      created_at: nowIso(),
    });

    await emailService.send({
      to: user.email,
      subject: 'Reset your Crozz password',
      text: `Use this token within 15 minutes: ${token}`,
    });
    return { sent: true };
  }

  async resetPassword(token, newPassword) {
    this.#assertPresent(token, 'Reset token is required');
    this.#assertPresent(newPassword, 'New password is required');

    const record = this.findPasswordResetStmt.get({
      token: this.#hashToken(token),
    });

    if (!record || record.used_at) {
      throw new Error('Reset token invalid');
    }

    if (record.expires_at < Date.now()) {
      throw new Error('Reset token expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds);
    this.updateUserPasswordStmt.run({
      id: record.user_id,
      password_hash: passwordHash,
      updated_at: nowIso(),
    });

    this.markPasswordResetUsedStmt.run({
      id: record.id,
      used_at: Date.now(),
    });

    const user = this.#getUserRowById(record.user_id);
    return this.#issueSession(this.#publicUser(user));
  }

  async forgotUsername(email) {
    this.#assertPresent(email, 'Email is required');
    const user = this.#getUserRowByEmail(email);
    if (!user) {
      return { sent: true };
    }

    await emailService.send({
      to: user.email,
      subject: 'Your Crozz username',
      text: `You registered as ${user.username}.`,
    });
    return { sent: true };
  }

  verifyAccessToken(token) {
    try {
      const payload = jwt.verify(token, this.jwtSecret, {
        issuer: this.jwtIssuer,
      });
      return payload;
    } catch {
      return null;
    }
  }

  findUserByEmail(email) {
    const row = this.#getUserRowByEmail(email);
    if (!row) return null;
    return this.#publicUser(row);
  }

  findUserByUsername(username) {
    const row = this.#getUserRowByUsername(username);
    if (!row) return null;
    return this.#publicUser(row);
  }

  findUserById(id) {
    const row = this.#getUserRowById(id);
    if (!row) return null;
    return this.#publicUser(row);
  }

  #issueSession(user) {
    const accessToken = this.#createAccessToken(user);
    const accessExpiresAt = new Date(Date.now() + this.accessTtlMs);

    const { refreshToken, refreshExpiresAt } = this.#createRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        accessTokenExpiresAt: accessExpiresAt.toISOString(),
        refreshToken,
        refreshTokenExpiresAt: new Date(refreshExpiresAt).toISOString(),
      },
    };
  }

  #createAccessToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        username: user.username,
        isAdmin: Boolean(user.isAdmin),
      },
      this.jwtSecret,
      {
        issuer: this.jwtIssuer,
        expiresIn: Math.floor(this.accessTtlMs / 1000),
      }
    );
  }

  #createRefreshToken(userId) {
    const token = this.#randomToken();
    const hashed = this.#hashToken(token);
    const expiresAt = Date.now() + this.refreshTtlMs;

    this.insertRefreshTokenStmt.run({
      id: randomUUID(),
      user_id: userId,
      token: hashed,
      expires_at: expiresAt,
      created_at: nowIso(),
    });

    return { refreshToken: token, refreshExpiresAt: expiresAt };
  }

  #publicUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      isAdmin: Boolean(row.is_admin),
      emailVerified: Boolean(row.email_verified),
      lastLoginAt: row.last_login_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  #getUserRowByEmail(email) {
    if (!email) return null;
    return this.findUserByEmailStmt.get({ email });
  }

  #getUserRowByUsername(username) {
    if (!username) return null;
    return this.findUserByUsernameStmt.get({ username });
  }

  #getUserRowById(id) {
    if (!id) return null;
    return this.findUserByIdStmt.get({ id });
  }

  #hashToken(value) {
    return createHash('sha256').update(value).digest('hex');
  }

  #randomToken() {
    return randomBytes(48).toString('hex');
  }

  #assertPresent(value, message) {
    if (!value) {
      throw new Error(message);
    }
  }
}

export const authService = new AuthService();
