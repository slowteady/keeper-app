import { z } from 'zod';

// 동물 종류
export const AnimalTypeSchema = z.enum(['DOG', 'CAT', 'OTHER', 'ALL']);
export type TAnimalTypeSchema = z.infer<typeof AnimalTypeSchema>;
