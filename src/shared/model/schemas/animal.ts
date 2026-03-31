import { z } from 'zod';

export const AnimalTypeSchema = z.enum(['DOG', 'CAT', 'OTHER', 'ALL']);
export type AnimalTypeDto = z.infer<typeof AnimalTypeSchema>;

export const GenderSchema = z.enum(['M', 'F', 'NONE']);
export type GenderDto = z.infer<typeof GenderSchema>;

export const NeuterYnSchema = z.enum(['Y', 'N', 'NONE']);
export type NeuterYnDto = z.infer<typeof NeuterYnSchema>;

export const VaccinationCheckSchema = z.enum(['NOT', 'FIRST', 'SECOND', 'THIRD', 'NONE']);
export type VaccinationCheckDto = z.infer<typeof VaccinationCheckSchema>;

export const HealthCheckSchema = z.enum(['Y', 'N', 'NONE']);
export type HealthCheckDto = z.infer<typeof HealthCheckSchema>;
