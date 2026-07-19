import { z } from 'zod';

import { MediaVideoSchema } from '@/shared/model';

export const MissingResponseSchema = z.object({
  id: z.string(),
  photos: z.array(z.string()),
  kind: z.string(),
  color: z.string().nullable(),
  sex: z.string().nullable(),
  age: z.string().nullable(),
  specialMark: z.string().nullable(),
  happenAddr: z.string(),
  happenPlace: z.string().nullable(),
  happenDt: z.string(),
  orgNm: z.string().nullable()
});
export type MissingResponseDto = z.infer<typeof MissingResponseSchema>;

export const MissingDataSchema = MissingResponseSchema.extend({
  hasCallTel: z.boolean()
});
export type MissingDataDto = z.infer<typeof MissingDataSchema>;

export const MissingContactSchema = z.object({
  callTel: z.string()
});
export type MissingContactDto = z.infer<typeof MissingContactSchema>;

export const MissingListSchema = z.object({
  items: z.array(MissingResponseSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean(),
  appliedRegion: z.string().nullable()
});
export type MissingListDto = z.infer<typeof MissingListSchema>;

export const MissingParamsSchema = z.object({
  size: z.number(),
  page: z.number().optional(),
  sido: z.string().optional(),
  sigungu: z.string().optional(),
  animalType: z.enum(['DOG', 'CAT', 'OTHER']).optional()
});
export type MissingParamsDto = z.infer<typeof MissingParamsSchema>;

export const ANIMAL_TYPES = ['DOG', 'CAT', 'OTHER'] as const;
export const MISSING_STATUSES = ['MISSING', 'RESOLVED'] as const;
export const CONTACT_TYPES = ['PHONE', 'EMAIL', 'SNS'] as const;
export const GENDER_VALUES = ['M', 'F'] as const;
export const ID_TAG_VALUES = ['Y', 'N'] as const;
export type MissingStatusDto = (typeof MISSING_STATUSES)[number];

export const MissingFeedItemSchema = z.object({
  source: z.enum(['PUBLIC', 'USER']),
  id: z.string(),
  sortDate: z.string(),
  thumbnail: z.string().nullable(),
  kindLabel: z.string(),
  region: z.string(),
  status: z.enum(MISSING_STATUSES),
  hasContact: z.boolean()
});
export type MissingFeedItemDto = z.infer<typeof MissingFeedItemSchema>;

export const MissingFeedListSchema = z.object({
  items: z.array(MissingFeedItemSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type MissingFeedListDto = z.infer<typeof MissingFeedListSchema>;

export const MissingContactItemSchema = z.object({
  type: z.enum(CONTACT_TYPES),
  value: z.string()
});
export type MissingContactItemDto = z.infer<typeof MissingContactItemSchema>;

export const MissingAuthorSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable(),
  image: z.string()
});

export const MissingDetailSchema = z.object({
  id: z.string(),
  animalType: z.enum(ANIMAL_TYPES),
  name: z.string().nullable(),
  breed: z.string().nullable(),
  gender: z.string().nullable(),
  age: z.string().nullable(),
  weight: z.string().nullable(),
  hasIdTag: z.enum(ID_TAG_VALUES).nullable(),
  rfid: z.string().nullable(),
  colorFeature: z.string(),
  description: z.string().nullable(),
  lostAt: z.string(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  address: z.string(),
  regionCode: z.string().nullable(),
  status: z.enum(MISSING_STATUSES),
  hasContact: z.boolean(),
  images: z.array(z.string()),
  videoUrl: z.string().nullable(),
  videoThumbnailUrl: z.string().nullable(),
  videoDuration: z.number().nullable(),
  author: MissingAuthorSchema.nullable(),
  isOwner: z.boolean(),
  contacts: z.array(MissingContactItemSchema).optional(),
  createdAt: z.string()
});
export type MissingDetailDto = z.infer<typeof MissingDetailSchema>;

export const MissingContactsSchema = z.object({
  contacts: z.array(MissingContactItemSchema),
  phone: z.string().optional()
});
export type MissingContactsDto = z.infer<typeof MissingContactsSchema>;

export const MissingCreateFormSchema = z.object({
  images: z.array(z.string()).min(1, '사진을 1장 이상 등록해 주세요'),
  video: MediaVideoSchema.nullable().optional(),
  animalType: z.enum(ANIMAL_TYPES),
  colorFeature: z.string().trim().min(1, '특징을 입력해 주세요').max(500, '특징은 500자 이내로 입력해 주세요'),
  lostAt: z
    .string()
    .min(1, '실종일시를 선택해 주세요')
    .refine((value) => new Date(value).getTime() <= Date.now(), '실종일시는 미래로 지정할 수 없어요'),
  address: z.string().min(1, '실종 장소를 입력해 주세요').max(255),
  lat: z.number({ message: '실종 장소를 다시 선택해 주세요' }),
  lng: z.number({ message: '실종 장소를 다시 선택해 주세요' }),
  regionCode: z.string().nullable().optional(),
  name: z.string().trim().min(1, '이름을 입력해 주세요').max(30, '이름은 30자 이내로 입력해 주세요'),
  gender: z.enum(GENDER_VALUES).optional(),
  specificType: z.string().trim().min(1, '품종을 선택해 주세요').max(100),
  age: z.string().trim().max(10).optional(),
  weight: z.string().trim().max(10).optional(),
  hasIdTag: z.enum(ID_TAG_VALUES, { message: '인식칩 여부를 선택해 주세요' }),
  rfid: z.string().trim().max(20, '등록번호는 20자 이내로 입력해 주세요').optional(),
  contact: z
    .array(
      z
        .object({
          type: z.enum(CONTACT_TYPES),
          value: z.string().trim().min(1, '연락처를 입력해 주세요').max(255, '연락처가 너무 길어요')
        })
        .refine((item) => item.type !== 'SNS' || /^https?:\/\//.test(item.value), {
          message: 'SNS는 https:// 링크로 입력해 주세요',
          path: ['value']
        })
    )
    .min(1, '연락처를 최소 1개 입력해 주세요')
});
export type MissingCreateFormDto = z.infer<typeof MissingCreateFormSchema>;
