import { z } from 'zod';

import { CREATE_POST_OPTIONS } from './constant';

export const CreatePostDto = z.object({
  animalType: z.enum([...CREATE_POST_OPTIONS.animalType.map((option) => option.value)] as const),
  gender: z.enum([...CREATE_POST_OPTIONS.gender.map((option) => option.value)] as const),
  neuterYn: z.enum([...CREATE_POST_OPTIONS.neuterYn.map((option) => option.value)] as const),
  protectionType: z.enum([...CREATE_POST_OPTIONS.protectionType.map((option) => option.value)] as const),
  vaccinationCheck: z.enum([...CREATE_POST_OPTIONS.vaccinationCheck.map((option) => option.value)] as const),
  weight: z.string().min(0, '몸무게를 입력해주세요.'),
  location: z.string().min(0, '지역을 입력해주세요.'),
  age: z.string().min(0, '나이를 입력해주세요.'),
  specificType: z.string().min(0, '품종을 입력해주세요.'),
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
  images: z.array(z.string()).min(1, '최소 1장의 이미지를 업로드해주세요.'),
  // 선택 입력 필드
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  health: z.string().optional(),
  relatedLink: z.string().optional(),
  rfid: z.string().optional()
});

export type TCreatePostDto = z.infer<typeof CreatePostDto>;
