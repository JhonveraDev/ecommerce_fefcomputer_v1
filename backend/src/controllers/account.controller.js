import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { prisma } from '../config/prisma.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const publicUser = (user) => ({ id: user.id, name: user.name, lastName: user.lastName, phone: user.phone, email: user.email, roles: user.roles.map(({ role }) => role.name) });
const addressFields = ['recipientName', 'phone', 'countryCode', 'region', 'city', 'addressLine1', 'addressLine2', 'reference', 'postalCode', 'isDefault'];
const addressInput = (body) => Object.fromEntries(addressFields.filter((key) => body[key] !== undefined).map((key) => [key, typeof body[key] === 'string' ? body[key].trim() : body[key]]));

export const profile = asyncHandler(async (request, response) => {
  const input = updateProfileSchema.parse(request.body);
  const emailOwner = await prisma.user.findFirst({ where: { email: input.email, NOT: { id: request.auth.userId } } });
  if (emailOwner) throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'Este correo ya está registrado.');
  const user = await prisma.user.update({ where: { id: request.auth.userId }, data: input, include: { roles: { include: { role: true } } } });
  response.json({ success: true, data: { user: publicUser(user) } });
});

export const listAddresses = asyncHandler(async (request, response) => {
  const addresses = await prisma.address.findMany({ where: { userId: request.auth.userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  response.json({ success: true, data: { addresses } });
});

export const createAddress = asyncHandler(async (request, response) => {
  const input = addressInput(request.body);
  for (const key of ['recipientName', 'phone', 'region', 'city', 'addressLine1']) if (!input[key]) throw new ApiError(422, 'VALIDATION_ERROR', 'Completa los campos obligatorios de la dirección.');
  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.address.updateMany({ where: { userId: request.auth.userId }, data: { isDefault: false } });
    const count = await tx.address.count({ where: { userId: request.auth.userId } });
    return tx.address.create({ data: { ...input, userId: request.auth.userId, countryCode: input.countryCode || 'CO', isDefault: input.isDefault || count === 0 } });
  });
  response.status(201).json({ success: true, data: { address } });
});

export const updateAddress = asyncHandler(async (request, response) => {
  const input = addressInput(request.body);
  const existing = await prisma.address.findFirst({ where: { id: request.params.id, userId: request.auth.userId } });
  if (!existing) throw new ApiError(404, 'ADDRESS_NOT_FOUND', 'No encontramos esa dirección.');
  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.address.updateMany({ where: { userId: request.auth.userId }, data: { isDefault: false } });
    return tx.address.update({ where: { id: existing.id }, data: input });
  });
  response.json({ success: true, data: { address } });
});

export const deleteAddress = asyncHandler(async (request, response) => {
  const existing = await prisma.address.findFirst({ where: { id: request.params.id, userId: request.auth.userId } });
  if (!existing) throw new ApiError(404, 'ADDRESS_NOT_FOUND', 'No encontramos esa dirección.');
  await prisma.address.delete({ where: { id: existing.id } });
  response.status(204).send();
});