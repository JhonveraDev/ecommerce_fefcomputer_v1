import { z } from 'zod';
const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(''));
export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(255), sku: optionalText(100), category: z.string().trim().min(2).max(120), brand: optionalText(120),
  basePrice: z.coerce.number().finite().nonnegative(), compareAtPrice: z.coerce.number().finite().nonnegative().optional().nullable(), offerStartsAt: z.coerce.date().optional().nullable(), offerEndsAt: z.coerce.date().optional().nullable(),
  physicalQuantity: z.coerce.number().int().nonnegative(), reorderPoint: z.coerce.number().int().nonnegative().default(0),
  shortDescription: optionalText(500), description: optionalText(10000), imageUrl: z.string().trim().url().max(2000).optional().or(z.literal('')), status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).default('ACTIVE'), isFeatured: z.boolean().default(false),
}).superRefine((value, context) => { if (value.offerStartsAt && value.offerEndsAt && value.offerEndsAt <= value.offerStartsAt) context.addIssue({ code: z.ZodIssueCode.custom, path: ['offerEndsAt'], message: 'La fecha de fin debe ser posterior a la fecha de inicio.' }); });
