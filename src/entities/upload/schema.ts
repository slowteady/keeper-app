import { z } from 'zod';

export const PresignedItemSchema = z.object({
  uploadUrl: z.string(),
  publicUrl: z.string()
});
export type PresignedItemDto = z.infer<typeof PresignedItemSchema>;

export const PresignedUrlsBodySchema = z.object({
  count: z.number().int().min(1).max(10),
  mediaType: z.enum(['image', 'video']).default('image')
});
export type PresignedUrlsBodyDto = z.input<typeof PresignedUrlsBodySchema>;

export const PresignedUrlsDataSchema = z.object({
  items: z.array(PresignedItemSchema)
});
export type PresignedUrlsDataDto = z.infer<typeof PresignedUrlsDataSchema>;
