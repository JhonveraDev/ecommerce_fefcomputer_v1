import { z } from 'zod';
const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(''));
const optionalInteger = z.coerce.number().int().nonnegative().optional().nullable();
const variantSchema = z.object({ id: z.string().uuid().optional(), sku: z.string().trim().min(1).max(100), attributes: z.record(z.string().max(100), z.string().max(1000)).default({}), priceOverride: z.coerce.number().finite().nonnegative().optional().nullable(), physicalQuantity: z.coerce.number().int().nonnegative(), reorderPoint: z.coerce.number().int().nonnegative().default(0) });
export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(255), sku: z.string().trim().min(1, 'El SKU es obligatorio.').max(100), categoryName: z.string().trim().min(2, 'La categoría es obligatoria.').max(120), brandName: optionalText(120),
  basePrice: z.coerce.number().finite().nonnegative(), compareAtPrice: z.coerce.number().finite().nonnegative().optional().nullable(), offerStartsAt: z.coerce.date().optional().nullable(), offerEndsAt: z.coerce.date().optional().nullable(),
  physicalQuantity: z.coerce.number().int().nonnegative(), reorderPoint: z.coerce.number().int().nonnegative().default(0), weightGrams: optionalInteger, lengthCm: optionalInteger, widthCm: optionalInteger, heightCm: optionalInteger,
  shortDescription: optionalText(500), description: optionalText(10000), imageUrls: z.array(z.string().trim().url().max(2000)).max(8).default([]), specifications: z.record(z.string().max(100), z.string().max(1000)).default({}), variants: z.array(variantSchema).max(20).default([]), status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).default('ACTIVE'), isFeatured: z.boolean().default(false),
}).superRefine((value, context) => { if (value.offerStartsAt && value.offerEndsAt && value.offerEndsAt <= value.offerStartsAt) context.addIssue({ code: z.ZodIssueCode.custom, path: ['offerEndsAt'], message: 'La fecha de fin debe ser posterior a la fecha de inicio.' }); });
