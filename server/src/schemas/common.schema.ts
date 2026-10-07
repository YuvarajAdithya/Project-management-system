import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.string().uuid('Invalid ID'),
}).strict();

export const optionalDateTime = z.string().datetime({ offset: true })
  .refine((value) => Number.isFinite(Date.parse(value)), 'Invalid date')
  .nullable().optional();

// A blank filter means no filter. Arrays and nested query objects remain invalid.
export const optionalFilter = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(
  (value) => typeof value === 'string' ? value.trim() || undefined : value,
  schema.optional(),
);

export const searchFilter = optionalFilter(z.string().max(200, 'Search must be at most 200 characters'));
