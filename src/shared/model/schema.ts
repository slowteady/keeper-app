import { z } from 'zod';

// 'NONE' enum 값은 구버전 데이터(chip default NONE 시절) 응답 호환용.
// 신규 작성/수정 흐름에선 UI(constant.ts) 에서 NONE chip 제거됐고
// from-detail.ts + api.ts orUndefined 가 NONE → undefined 로 정규화.

export const AnimalTypeSchema = z.enum(['DOG', 'CAT', 'OTHER', 'ALL']);
export type AnimalTypeDto = z.infer<typeof AnimalTypeSchema>;

export const GenderSchema = z.enum(['M', 'F', 'NONE']);
export type GenderDto = z.infer<typeof GenderSchema>;

// 'U'(미상) 는 DB YnType·백엔드 DTO 가 허용하는 값 — 프론트도 받아야 정합 (없으면 U 응답에 파싱 크래시).
export const NeuterYnSchema = z.enum(['Y', 'N', 'U', 'NONE']);
export type NeuterYnDto = z.infer<typeof NeuterYnSchema>;

export const VaccinationCheckSchema = z.enum(['NOT', 'FIRST', 'SECOND', 'THIRD', 'NONE']);
export type VaccinationCheckDto = z.infer<typeof VaccinationCheckSchema>;

export const HealthCheckSchema = z.enum(['Y', 'N', 'U', 'NONE']);
export type HealthCheckDto = z.infer<typeof HealthCheckSchema>;
