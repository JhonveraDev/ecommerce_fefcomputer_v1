import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validators/auth.validator.js';
import * as authService from '../services/auth.service.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

const refreshCookieOptions = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/v1/auth' };
const publicUser = (user) => ({ id: user.id, name: user.name, lastName: user.lastName, phone: user.phone, email: user.email, roles: user.roles.map(({ role }) => role.name) });
const sendAuthenticationResponse = (response, result, statusCode = 200) => { response.cookie('refreshToken', result.refreshToken, refreshCookieOptions); response.status(statusCode).json({ success: true, data: { user: publicUser(result.user), accessToken: result.accessToken } }); };

export const register = asyncHandler(async (request, response) => { const input = registerSchema.parse(request.body); sendAuthenticationResponse(response, await authService.register(input, request), 201); });
export const login = asyncHandler(async (request, response) => { const input = loginSchema.parse(request.body); sendAuthenticationResponse(response, await authService.login(input, request)); });
export const refresh = asyncHandler(async (request, response) => { sendAuthenticationResponse(response, await authService.refresh(request.cookies.refreshToken, request)); });
export const logout = asyncHandler(async (request, response) => { await authService.revokeRefreshToken(request.cookies.refreshToken); response.clearCookie('refreshToken', refreshCookieOptions); response.status(204).send(); });
export const me = asyncHandler(async (request, response) => {
  const user = await prisma.user.findUnique({ where: { id: request.auth.userId }, include: { roles: { include: { role: true } } } });
  if (!user || user.status !== 'ACTIVE') throw new ApiError(401, 'ACCOUNT_UNAVAILABLE', 'La sesión no está disponible.');
  response.json({ success: true, data: { user: publicUser(user) } });
});
export const forgotPassword = asyncHandler(async (request, response) => {
  const input = forgotPasswordSchema.parse(request.body);
  await authService.createPasswordReset(input.email);
  response.status(202).json({ success: true, data: { message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' } });
});
export const resetPassword = asyncHandler(async (request, response) => {
  const input = resetPasswordSchema.parse(request.body);
  await authService.resetPassword(input);
  response.json({ success: true, data: { message: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' } });
});