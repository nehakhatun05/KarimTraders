import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (10 digits starting with 6-9)')
  .transform((val) => val.replace(/\s+/g, ''));

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const weakPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password too long');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .trim();

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Invalid pincode');

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .min(2)
  .max(100);

export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const positiveNumberSchema = z.number().positive('Must be a positive number');

export const priceSchema = z.number().min(0, 'Price cannot be negative').max(1000000, 'Price too high');

export const quantitySchema = z.number().int().min(1, 'Minimum quantity is 1').max(100, 'Maximum quantity is 100');

export const ratingSchema = z.number().int().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5');

export const urlSchema = z.string().url('Invalid URL').or(z.string().startsWith('/'));

// Complex validation schemas
export const addressSchema = z.object({
  type: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
  name: nameSchema,
  phone: phoneSchema,
  addressLine1: z.string().min(5, 'Address too short').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: pincodeSchema,
  landmark: z.string().max(200).optional(),
  isDefault: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: weakPasswordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  image: urlSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: weakPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: weakPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const reviewSchema = z.object({
  productId: mongoIdSchema,
  rating: ratingSchema,
  title: z.string().max(100).optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  images: z.array(urlSchema).max(5).optional(),
});

export const productFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: slugSchema.optional(),
  search: z.string().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().max(1000000).optional(),
  sortBy: z.enum(['price', 'name', 'rating', 'createdAt', 'discount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  organic: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
});

export const orderSchema = z.object({
  addressId: mongoIdSchema,
  paymentMethod: z.enum(['COD', 'ONLINE', 'WALLET']),
  deliverySlotId: mongoIdSchema.optional(),
  notes: z.string().max(500).optional(),
  couponCode: z.string().max(50).optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().max(200).optional(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_DELIVERY']),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().default(1),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().default(true),
});

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeForSearch(input: string): string {
  return input
    .replace(/[<>'"`;\\]/g, '')
    .trim()
    .slice(0, 100);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/^\+91/, '').replace(/^91/, '');
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}
