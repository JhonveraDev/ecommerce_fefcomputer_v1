import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const createAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, roles: user.roles.map(({ role }) => role.name), type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  );

export const createRefreshToken = (userId, sessionId) =>
  jwt.sign({ sub: userId, sid: sessionId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
