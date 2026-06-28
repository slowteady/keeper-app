import { z } from 'zod';

import {
  AnimalTypeSchema,
  GenderSchema,
  HealthCheckSchema,
  NeuterYnSchema,
  VaccinationCheckSchema
} from '@/shared/model';

import { CREATE_POST_OPTIONS } from './constant';

export const ProtectionTypeSchema = z.enum(['TEMPORARY', 'ADOPTION', 'BOTH']);
export type ProtectionTypeDto = z.infer<typeof ProtectionTypeSchema>;

export const CommunityAdoptFormSchema = z.object({
  animalType: AnimalTypeSchema,
  protectionType: ProtectionTypeSchema,
  title: z.string().min(2, '제목을 2자 이상 입력해주세요').max(50, '제목은 50자 이내로 입력해주세요'),
  content: z.string().min(1, '소개글을 입력해주세요'),
  images: z.array(z.string()).min(1, '최소 1장의 이미지를 업로드해주세요'),
  contact: z
    .array(
      z
        .object({
          type: z.enum([...CREATE_POST_OPTIONS.contact.map((option) => option.value)] as const),
          value: z.string().trim().min(1, '연락처를 입력해주세요')
        })
        .refine((c) => c.type !== 'SNS' || z.string().url().safeParse(c.value).success, {
          message: 'SNS는 https:// 링크로 입력해주세요',
          path: ['value']
        })
    )
    .min(1, '연락처를 최소 1개 입력해주세요'),
  specificType: z.string().optional(),
  gender: GenderSchema.optional(),
  neuterYn: NeuterYnSchema.optional(),
  healthCheck: HealthCheckSchema.optional(),
  vaccinationCheck: VaccinationCheckSchema.optional(),
  age: z.string().optional(),
  weight: z
    .string()
    .regex(/^(\d{1,3}(\.\d{1,2})?)?$/, '몸무게는 99.99kg 까지 숫자로 입력해주세요')
    .optional(),
  location: z.string().trim().min(1, '장소를 입력해주세요'),
  regionCode: z.string().optional(),
  health: z.string().optional(),
  relatedLink: z.string().max(500).optional(),
  toiletTraining: z.enum(['COMPLETE', 'IN_PROGRESS', 'NEEDED']).optional(),
  separationAnxiety: z.enum(['NONE', 'SOMETIMES', 'SEVERE']).optional(),
  barking: z.enum(['NONE', 'SOMETIMES', 'OFTEN']).optional(),
  activityLevel: z.enum(['VERY_CALM', 'CALM', 'NORMAL', 'ACTIVE', 'VERY_ACTIVE']).optional(),
  withChildren: z.enum(['GOOD', 'SHY', 'HARD']).optional(),
  withDogs: z.enum(['GOOD', 'SHY', 'HARD']).optional(),
  withCats: z.enum(['GOOD', 'SHY', 'HARD']).optional()
});
export type CommunityAdoptFormDto = z.infer<typeof CommunityAdoptFormSchema>;

export const PostUserSummarySchema = z.object({
  id: z.string(),
  image: z.string(),
  nickname: z.string().nullable()
});
export type PostUserSummaryDto = z.infer<typeof PostUserSummarySchema>;

export const PostContactSchema = z.object({
  type: z.enum(['PHONE', 'EMAIL', 'SNS']),
  value: z.string()
});
export type PostContactDto = z.infer<typeof PostContactSchema>;

export const CommunityAdoptDetailSchema = z.object({
  id: z.string(),
  user: PostUserSummarySchema.nullable(),
  displayTime: z.string(),
  title: z.string(),
  images: z.array(z.string()),
  content: z.string().nullish(),
  age: z.string().nullish(),
  gender: z.string().nullish(),
  weight: z.string().nullish(),
  animalType: AnimalTypeSchema,
  specificType: z.string().nullish(),
  location: z.string().nullish(),
  healthCheck: HealthCheckSchema.nullish(),
  neuterYn: NeuterYnSchema.nullish(),
  vaccinationCheck: VaccinationCheckSchema.nullish(),
  protectionType: ProtectionTypeSchema,
  health: z.string().nullish(),
  relatedLink: z.string().nullish(),
  rfid: z.string().nullish(),
  toiletTraining: z.enum(['COMPLETE', 'IN_PROGRESS', 'NEEDED']).nullish(),
  separationAnxiety: z.enum(['NONE', 'SOMETIMES', 'SEVERE']).nullish(),
  barking: z.enum(['NONE', 'SOMETIMES', 'OFTEN']).nullish(),
  activityLevel: z.enum(['VERY_CALM', 'CALM', 'NORMAL', 'ACTIVE', 'VERY_ACTIVE']).nullish(),
  withChildren: z.enum(['GOOD', 'SHY', 'HARD']).nullish(),
  withDogs: z.enum(['GOOD', 'SHY', 'HARD']).nullish(),
  withCats: z.enum(['GOOD', 'SHY', 'HARD']).nullish(),
  adoptionStatus: z.enum(['IN_PROGRESS', 'COMPLETED']).nullish(),
  hasContact: z.boolean(),
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
  id: z.string(),
  category: z.enum(['ADOPTION_PERSONAL', 'ADOPTION_LIFE', 'QNA']).nullish(),
  user: PostUserSummarySchema.nullable(),
  displayTime: z.string(),
  title: z.string(),
  images: z.array(z.string()),
  content: z.string().nullish(),
  animalType: AnimalTypeSchema.nullish(),
  gender: z.string().nullish(),
  neuterYn: NeuterYnSchema.nullish(),
  protectionType: ProtectionTypeSchema.nullish(),
  vaccinationCheck: VaccinationCheckSchema.nullish(),
  specificType: z.string().nullish(),
  age: z.string().nullish(),
  weight: z.string().nullish(),
  location: z.string().nullish(),
  adoptionStatus: z.enum(['IN_PROGRESS', 'COMPLETED']).nullish(),
  keywords: z.array(z.string()).nullish(),
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

export const QnaTypeSchema = z.enum(['ADOPTION', 'VOLUNTEER', 'TRAINING', 'HEALTH', 'ETC']);
export type QnaTypeDto = z.infer<typeof QnaTypeSchema>;

export const QnaAnimalTypeSchema = z.enum(['DOG', 'CAT', 'OTHER']);
export type QnaAnimalTypeDto = z.infer<typeof QnaAnimalTypeSchema>;

export const CommunityQnaFormSchema = z.object({
  title: z.string().min(2, '제목은 2자 이상이에요').max(50, '제목은 50자 이내로 입력해주세요'),
  content: z.string().min(2, '본문은 2자 이상이에요').max(1000, '본문은 1000자 이내로 입력해주세요'),
  type: QnaTypeSchema,
  animalType: z.enum(['DOG', 'CAT', 'OTHER'], { error: '동물 종류를 선택해주세요' }),
  images: z.array(z.string()).max(10, '이미지는 최대 10장까지 첨부할 수 있어요').optional()
});
export type CommunityQnaFormDto = z.infer<typeof CommunityQnaFormSchema>;

export const ADOPT_FORM_FIELD_ORDER: (keyof CommunityAdoptFormDto)[] = [
  'images',
  'protectionType',
  'title',
  'content',
  'animalType',
  'contact'
];
export const QNA_FORM_FIELD_ORDER: (keyof CommunityQnaFormDto)[] = ['type', 'animalType', 'title', 'content', 'images'];

export const CommunityQnaListItemSchema = z.object({
  id: z.string(),
  user: PostUserSummarySchema.nullable(),
  displayTime: z.string(),
  title: z.string(),
  content: z.string().nullish(),
  qnaType: QnaTypeSchema,
  animalType: QnaAnimalTypeSchema,
  images: z.array(z.string()),
  counts: z.object({
    like: z.number(),
    view: z.number(),
    comment: z.number()
  }),
  isLiked: z.boolean().default(false)
});
export type CommunityQnaListItemDto = z.infer<typeof CommunityQnaListItemSchema>;

export const CommunityQnaListResponseSchema = z.object({
  items: z.array(CommunityQnaListItemSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type CommunityQnaListResponseDto = z.infer<typeof CommunityQnaListResponseSchema>;

export const CommunityQnaDetailSchema = z.object({
  id: z.string(),
  user: PostUserSummarySchema.nullable(),
  displayTime: z.string(),
  title: z.string(),
  content: z.string(),
  qnaType: QnaTypeSchema,
  animalType: QnaAnimalTypeSchema,
  images: z.array(z.string()),
  counts: z.object({
    like: z.number(),
    view: z.number(),
    comment: z.number()
  }),
  isLiked: z.boolean().default(false)
});
export type CommunityQnaDetailDto = z.infer<typeof CommunityQnaDetailSchema>;

export const MyCommentItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  displayTime: z.string(),
  postId: z.string(),
  postCategory: z.enum(['ADOPTION_PERSONAL', 'ADOPTION_LIFE', 'QNA']),
  postTitle: z.string(),
  postThumbnail: z.string().nullable(),
  parentId: z.string().nullable().default(null)
});
export type MyCommentItemDto = z.infer<typeof MyCommentItemSchema>;

export const MyCommentListResponseSchema = z.object({
  items: z.array(MyCommentItemSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type MyCommentListResponseDto = z.infer<typeof MyCommentListResponseSchema>;

export const MyPostItemSchema = CommunityAdoptListSchema.extend({
  category: z.enum(['ADOPTION_PERSONAL', 'ADOPTION_LIFE', 'QNA'])
});
export type MyPostItemDto = z.infer<typeof MyPostItemSchema>;

export const MyPostListResponseSchema = z.object({
  items: z.array(MyPostItemSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type MyPostListResponseDto = z.infer<typeof MyPostListResponseSchema>;
