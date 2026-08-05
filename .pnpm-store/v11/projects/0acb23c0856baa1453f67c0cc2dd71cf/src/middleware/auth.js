import { ApiError } from '../utils/api-error.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const authenticate = (request, _response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Debes iniciar sesión para continuar.'));
  }

  try {
    const payload = verifyAccessToken(authorization.slice(7));

    if (payload.type !== 'access') {
      return next(new ApiError(401, 'INVALID_ACCESS_TOKEN', 'La sesión no es válida.'));
    }

    request.auth = { userId: payload.sub, roles: payload.roles ?? [] };
    return next();
  } catch {
    return next(new ApiError(401, 'INVALID_ACCESS_TOKEN', 'La sesión expiró o no es válida.'));
  }
};

export const authorize = (...roles) => (request, _response, next) => {
  if (!request.auth?.roles.some((role) => roles.includes(role))) {
    return next(new ApiError(403, 'INSUFFICIENT_PERMISSIONS', 'No tienes permisos para realizar esta acción.'));
  }

  return next();
};
