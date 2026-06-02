import { AxiosResponse } from 'axios';

import { CommunityAdoptDetailDto, CommunityAdoptDetailSchema, CommunityAdoptFormDto } from '@/entities/community';
import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

const BASE = '/community/posts';

type CreateAdoptionPersonalBody = {
  category: 'ADOPTION_PERSONAL';
  title: string;
  content: string;
  animalType: CommunityAdoptFormDto['animalType'];
  protectionType: CommunityAdoptFormDto['protectionType'];
  contacts: { type: string; value: string }[];
  tags: string[];
  images?: string[];
  specificType?: string;
  age?: string;
  weight?: string;
  gender?: string;
  neuterYn?: CommunityAdoptFormDto['neuterYn'];
  healthCheck?: CommunityAdoptFormDto['healthCheck'];
  vaccinationCheck?: CommunityAdoptFormDto['vaccinationCheck'];
  location?: string;
  specialMark?: string;
  likes?: string;
  dislikes?: string;
  health?: string;
  relatedLink?: string;
};

// 빈 문자열 / 'NONE' / null / undefined 모두 백엔드 NULL 로 — chip 미선택 / 구버전 데이터 호환
const orUndefined = <T>(value: T | undefined | null | '' | 'NONE'): T | undefined =>
  value === '' || value === 'NONE' || value === null || value === undefined ? undefined : (value as T);

export const toCreateAdoptionPersonalBody = (
  form: CommunityAdoptFormDto,
  uploadedImageUrls: string[]
): CreateAdoptionPersonalBody => ({
  category: 'ADOPTION_PERSONAL',
  title: form.title,
  content: form.content,
  animalType: form.animalType,
  protectionType: form.protectionType,
  contacts: form.contact.map((c) => ({ type: c.type, value: c.value })),
  tags: [],
  images: uploadedImageUrls,
  specificType: orUndefined(form.specificType),
  age: orUndefined(form.age),
  weight: orUndefined(form.weight),
  gender: orUndefined(form.gender),
  neuterYn: orUndefined(form.neuterYn),
  healthCheck: orUndefined(form.healthCheck),
  vaccinationCheck: orUndefined(form.vaccinationCheck),
  location: orUndefined(form.location),
  specialMark: orUndefined(form.specialMark),
  likes: orUndefined(form.likes),
  dislikes: orUndefined(form.dislikes),
  health: orUndefined(form.health),
  relatedLink: orUndefined(form.relatedLink)
});

export const createAdoptionPersonal = async (body: CreateAdoptionPersonalBody): Promise<CommunityAdoptDetailDto> => {
  const res: AxiosResponse<ApiResponse<unknown>> = await authApi.post(`${BASE}/adoption-personal`, body);
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

export const updateAdoptionPersonal = async (
  id: string,
  body: CreateAdoptionPersonalBody
): Promise<CommunityAdoptDetailDto> => {
  const res: AxiosResponse<ApiResponse<unknown>> = await authApi.patch(`${BASE}/adoption-personal/${id}`, body);
  return CommunityAdoptDetailSchema.parse(res.data.data);
};
