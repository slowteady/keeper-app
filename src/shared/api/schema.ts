import { z } from 'zod';

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.literal('OK'),
    message: z.string().optional(),
    data: dataSchema
  });

export const pageResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    total: z.number(),
    page: z.number(),
    size: z.number(),
    has_next: z.boolean(),
    value: z.array(itemSchema)
  });
