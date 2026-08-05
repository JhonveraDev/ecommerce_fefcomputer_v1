import crypto from 'node:crypto';

export const requestId = (request, response, next) => {
  request.id = crypto.randomUUID();
  response.setHeader('X-Request-Id', request.id);
  next();
};
