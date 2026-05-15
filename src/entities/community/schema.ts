import { z } from 'zod';

import {
  AnimalTypeSchema,
  GenderSchema,
  HealthCheckSchema,
  NeuterYnSchema,
  VaccinationCheckSchema
} from '@/shared/model';

import { CREATE_POST_OPTIONS } from './constant';

// 보호 유형
export const ProtectionTypeSchema = z.enum(['TEMPORARY', 'ADOPTION', 'BOTH']);
export type ProtectionTypeDto = z.infer<typeof ProtectionTypeSchema>;

export const CommunityAdoptFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  animalType: AnimalTypeSchema,
  specificType: z.string().min(1, '품종을 입력해주세요'),
  images: z.array(z.string()).min(1, '최소 1장의 이미지를 업로드해주세요'),
  gender: GenderSchema,
  neuterYn: NeuterYnSchema,
  healthCheck: HealthCheckSchema,
  age: z.string().min(1, '나이를 입력해주세요'),
  weight: z.string().min(1, '몸무게를 입력해주세요'),
  location: z.string().min(1, '지역을 입력해주세요'),
  specialMark: z.string().min(1, '특징을 입력해주세요'),
  content: z.string().min(1, '소개글을 입력해주세요'),
  contact: z
    .array(
      z.object({
        type: z.enum([...CREATE_POST_OPTIONS.contact.map((option) => option.value)] as const),
        value: z.string()
      })
    )
    .min(1, '최소 1개의 연락 정보를 입력해주세요'),
  // 선택 입력 필드
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  health: z.string().optional(),
  relatedLink: z.string().optional(),
  protectionType: ProtectionTypeSchema,
  vaccinationCheck: VaccinationCheckSchema
});
export type CommunityAdoptFormDto = z.infer<typeof CommunityAdoptFormSchema>;

export const PostUserSummarySchema = z.object({
  id: z.number(),
  image: z.string(),
  nickname: z.string()
});
export type PostUserSummaryDto = z.infer<typeof PostUserSummarySchema>;

export const PostContactSchema = z.object({
  // 백엔드 PostContactType 과 정합 — PHONE/EMAIL/SNS
  type: z.enum(['PHONE', 'EMAIL', 'SNS']),
  value: z.string()
});
export type PostContactDto = z.infer<typeof PostContactSchema>;

export const CommunityAdoptDetailSchema = z.object({
  id: z.number(),
  user: PostUserSummarySchema.nullable(),
  displayTime: z.string(),
  title: z.string(),
  images: z.array(z.string()),
  // null + undefined 둘 다 허용 (nullish) — DB nullable 컬럼이 null 로 응답됨
  content: z.string().nullish(),
  age: z.string(),
  gender: z.string(),
  weight: z.string(),
  animalType: AnimalTypeSchema,
  specificType: z.string(),
  location: z.string(),
  healthCheck: HealthCheckSchema.nullish(),
  neuterYn: NeuterYnSchema,
  vaccinationCheck: VaccinationCheckSchema.nullish(),
  protectionType: ProtectionTypeSchema,
  specialMark: z.string().nullish(),
  likes: z.string().nullish(),
  dislikes: z.string().nullish(),
  health: z.string().nullish(),
  relatedLink: z.string().nullish(),
  rfid: z.string().nullish(),
  contacts: z.array(PostContactSchema),
  counts: z.object({
    like: z.number(),
    view: z.number(),
    comment: z.number()
  }),
  isLiked: z.boolean()
});
export type CommunityAdoptDetailDto = z.infer<typeof CommunityAdoptDetailSchema>;

export const CommunityAdoptListSchema = z.object({
  id: z.number(),
  user: PostUserSummarySchema.nullable(),
  displayTime: z.string(),
  title: z.string(),
  images: z.array(z.string()),
  content: z.string().optional(),
  // 카테고리별 raw enum/원본 — 프론트 mapper 가 라벨로 변환
  animalType: AnimalTypeSchema.optional(),
  gender: z.string().optional(),
  neuterYn: NeuterYnSchema.optional(),
  protectionType: ProtectionTypeSchema.optional(),
  vaccinationCheck: VaccinationCheckSchema.optional(),
  // 입양생활 자유 입력 키워드
  keywords: z.array(z.string()).optional(),
  counts: z.object({
    like: z.number(),
    view: z.number(),
    comment: z.number()
  }),
  isLiked: z.boolean()
});
export type CommunityAdoptListDto = z.infer<typeof CommunityAdoptListSchema>;

export const CommunityListResponseSchema = z.object({
  items: z.array(CommunityAdoptListSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type CommunityListResponseDto = z.infer<typeof CommunityListResponseSchema>;
