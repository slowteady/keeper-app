import { z } from 'zod';

export const PosterSchema = z.object({
  url: z.string().url()
});

export type PosterDto = z.infer<typeof PosterSchema>;
