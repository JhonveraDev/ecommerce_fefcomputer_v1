import { ApiError } from '../utils/api-error.js';

export const notFoundHandler = (request, _response, next) =>
  next(new ApiError(404, 'ROUTE_NOT_FOUND', `No existe la ruta ${request.method} ${request.originalUrl}.`));

export const errorHandler = (error, request, response, _next) => {
  const isKnownPrismaError = typeof error?.code === 'string' && error.code.startsWith('P');
  const isValidationError = error?.name === 'ZodError';
  const statusCode = error instanceof ApiError ? error.statusCode : isValidationError ? 422 : isKnownPrismaError ? 409 : 500;
  const code = error instanceof ApiError ? error.code : isValidationError ? 'VALIDATION_ERROR' : isKnownPrismaError ? 'DATABASE_CONFLICT' : 'INTERNAL_ERROR';
  const message = error instanceof ApiError ? error.message : isValidationError ? 'Revisa los datos enviados.' : 'Ocurrió un error inesperado.';
  const details = error instanceof ApiError ? error.details : isValidationError ? error.issues : [];

  if (statusCode >= 500) {
    console.error({ requestId: request.id, error });
  }

  response.status(statusCode).json({
    success: false,
    error: { code, message, details },
    requestId: request.id,
  });
};
