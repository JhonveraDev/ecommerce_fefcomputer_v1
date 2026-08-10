import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { prisma } from '../config/prisma.js';

const allowed = new Set(['cart', 'wishlist', 'compare']);
const limits = { cart: 100, wishlist: 100, compare: 4 };

const stateFor = (userId) => prisma.userShoppingState.upsert({
  where: { userId },
  update: {},
  create: { userId, cart: [], wishlist: [], compare: [] },
});

export const getShoppingState = asyncHandler(async (request, response) => {
  const state = await stateFor(request.auth.userId);
  response.json({ success: true, data: { cart: state.cart, wishlist: state.wishlist, compare: state.compare } });
});

export const updateShoppingState = asyncHandler(async (request, response) => {
  const key = request.params.key;
  const value = request.body?.items;
  if (!allowed.has(key) || !Array.isArray(value) || value.length > limits[key]) throw new ApiError(422, 'VALIDATION_ERROR', 'El estado enviado no es válido.');
  const state = await prisma.userShoppingState.upsert({
    where: { userId: request.auth.userId },
    update: { [key]: value },
    create: { userId: request.auth.userId, cart: key === 'cart' ? value : [], wishlist: key === 'wishlist' ? value : [], compare: key === 'compare' ? value : [] },
  });
  response.json({ success: true, data: { items: state[key] } });
});