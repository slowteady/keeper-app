import { z } from 'zod';

import { AdoptBaseDto, GenderSchema, NeuterYnSchema, VaccinationCheckSchema } from '@/entities/adopt';
import { AnimalTypeSchema } from '@/shared';

import { CREATE_POST_OPTIONS } from './constant';

// 보호 유형
export const ProtectionTypeSchema = z.enum(['TEMPORARY', 'ADOPTION', 'BOTH']);
export type TProtectionTypeSchema = z.infer<typeof ProtectionTypeSchema>;

export const CreatePostDto = z.object({
  images: z.array(z.string()).min(1, '최소 1장의 이미지를 업로드해주세요.'),
  specificType: z.string().min(0, '품종을 입력해주세요.'),
  animalType: AnimalTypeSchema,
  gender: GenderSchema,
  neuterYn: NeuterYnSchema,
  age: z.string().min(0, '나이를 입력해주세요.'),
  weight: z.string().min(0, '몸무게를 입력해주세요.'),
  location: z.string().min(0, '지역을 입력해주세요.'),
  specialMark: z.string().min(0, '특징을 입력해주세요.'),
  introduction: z.string().min(0, '소개글을 입력해주세요.'),
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
export type TCreatePostDto = z.infer<typeof CreatePostDto>;

export const DetailPostDto = AdoptBaseDto.extend({
  id: z.string() // 게시물 id,
});
export type TDetailPostDto = z.infer<typeof DetailPostDto>;
