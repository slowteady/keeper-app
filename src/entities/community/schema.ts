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
  title: z.string().min(1, '제목을 입력해주세요.'),
  animalType: AnimalTypeSchema,
  specificType: z.string().min(1, '품종을 입력해주세요.'),
  images: z.array(z.string()).min(1, '최소 1장의 이미지를 업로드해주세요.'),
  gender: GenderSchema,
  neuterYn: NeuterYnSchema,
  healthCheck: HealthCheckSchema,
  age: z.string().min(1, '나이를 입력해주세요.'),
  weight: z.string().min(1, '몸무게를 입력해주세요.'),
  location: z.string().min(1, '지역을 입력해주세요.'),
  specialMark: z.string().min(1, '특징을 입력해주세요.'),
  content: z.string().min(1, '소개글을 입력해주세요.'),
  contact: z
    .array(
      z.object({
        type: z.enum([...CREATE_POST_OPTIONS.contact.map((option) => option.value)] as const),
        value: z.string()
      })
    )
    .min(1, '최소 1개의 연락 정보를 입력해주세요.'),
  // 선택 입력 필드
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  health: z.string().optional(),
  relatedLink: z.string().optional(),
  protectionType: ProtectionTypeSchema,
  vaccinationCheck: VaccinationCheckSchema
});
export type CommunityAdoptFormDto = z.infer<typeof CommunityAdoptFormSchema>;

export const CommunityAdoptDetailSchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    image: z.string(),
    nickname: z.string()
  }),
  displayTime: z.string(),
  title: z.string(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  content: z.string(),
  age: z.string(),
  gender: z.string(),
  weight: z.string(),
  healthCheck: HealthCheckSchema,
  neuterYn: NeuterYnSchema,
  vaccinationCheck: VaccinationCheckSchema,
  specialMark: z.string(),
  likes: z.string(),
  dislikes: z.string(),
  health: z.string(),
  relatedLink: z.string(),
  counts: z.object({
    like: z.number(),
    view: z.number(),
    comment: z.number()
  })
});
export type CommunityAdoptDetailDto = z.infer<typeof CommunityAdoptDetailSchema>;

export const CommunityAdoptListSchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    image: z.string(),
    nickname: z.string()
  }),
  displayTime: z.string(),
  title: z.string(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  content: z.string(),
  counts: z.object({
    like: z.number(),
    view: z.number(),
    comment: z.number()
  }),
  isLiked: z.boolean()
});
export type CommunityAdoptListDto = z.infer<typeof CommunityAdoptListSchema>;
