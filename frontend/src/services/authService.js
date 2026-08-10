const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const messageFor = (error) => {
  const code = error?.error?.code;
  const messages = {
    INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
    EMAIL_ALREADY_REGISTERED: 'Este correo ya está registrado.',
    AUTHENTICATION_REQUIRED: 'Debes iniciar sesión para continuar.',
    INVALID_ACCESS_TOKEN: 'Tu sesión expiró. Inicia sesión nuevamente.',
    TOO_MANY_AUTH_ATTEMPTS: 'Demasiados intentos. Inténtalo más tarde.',
  };
  return messages[code] || error?.error?.message || 'No fue posible completar la solicitud.';
};

export async function apiRequest(path, options = {}, accessToken) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) };
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(messageFor(body));
    error.status = response.status;
    error.code = body?.error?.code;
    throw error;
  }
  return body?.data;
}

export const authService = {
  login: (input) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  refresh: () => apiRequest('/auth/refresh', { method: 'POST' }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (input) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(input) }),
};