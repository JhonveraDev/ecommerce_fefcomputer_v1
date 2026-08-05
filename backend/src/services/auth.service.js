import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { ROLES } from '../constants/roles.js';
import { ApiError } from '../utils/api-error.js';
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../utils/tokens.js';

const userWithRoles = { roles: { include: { role: true } } };

const issueSession = async (user, request) => {
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 1000),
      userAgent: request.get('user-agent')?.slice(0, 500),
      ipAddress: request.ip,
    },
  });
  const refreshToken = createRefreshToken(user.id, session.id);
  const decodedRefreshToken = verifyRefreshToken(refreshToken);

  await prisma.session.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
    },
  });

  return { accessToken: createAccessToken(user), refreshToken };
};

export const register = async (input, request) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'No fue posible crear la cuenta con esos datos.');
  }

  const customerRole = await prisma.role.findUnique({ where: { name: ROLES.CUSTOMER } });

  if (!customerRole) {
    throw new ApiError(500, 'CUSTOMER_ROLE_MISSING', 'La configuración inicial de roles no está completa.');
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      status: 'ACTIVE',
      roles: { create: { roleId: customerRole.id } },
    },
    include: userWithRoles,
  });

  return { user, ...(await issueSession(user, request)) };
};

export const login = async (input, request) => {
  const user = await prisma.user.findUnique({ where: { email: input.email }, include: userWithRoles });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'ACCOUNT_UNAVAILABLE', 'La cuenta no está disponible.');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { user, ...(await issueSession(user, request)) };
};

export const refresh = async (refreshToken, request) => {
  if (!refreshToken) {
    throw new ApiError(401, 'REFRESH_TOKEN_REQUIRED', 'Debes iniciar sesión para continuar.');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'La sesión expiró o no es válida.');
  }

  if (payload.type !== 'refresh' || !payload.sid) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'La sesión no es válida.');
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
    include: { user: { include: userWithRoles } },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date() || session.tokenHash !== hashToken(refreshToken)) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'La sesión no es válida.');
  }

  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  return { user: session.user, ...(await issueSession(session.user, request)) };
};

export const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) return;

  await prisma.session.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
