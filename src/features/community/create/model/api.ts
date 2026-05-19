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
  specificType: string;
  age: string;
  weight: string;
  gender: string;
  neuterYn: CommunityAdoptFormDto['neuterYn'];
  healthCheck?: CommunityAdoptFormDto['healthCheck'];
  protectionType: CommunityAdoptFormDto['protectionType'];
  vaccinationCheck?: CommunityAdoptFormDto['vaccinationCheck'];
  location: string;
  specialMark: string;
  contacts: { type: string; value: string }[];
  tags: string[];
  likes?: string;
  dislikes?: string;
  health?: string;
  relatedLink?: string;
  images?: string[];
};

export const toCreateAdoptionPersonalBody = (
  form: CommunityAdoptFormDto,
  uploadedImageUrls: string[]
): CreateAdoptionPersonalBody => ({
  category: 'ADOPTION_PERSONAL',
  title: form.title,
  content: form.content,
  animalType: form.animalType,
  specificType: form.specificType,
  age: form.age,
  weight: form.weight,
  gender: form.gender,
  neuterYn: form.neuterYn,
  healthCheck: form.healthCheck === 'NONE' ? undefined : form.healthCheck,
  protectionType: form.protectionType,
  vaccinationCheck: form.vaccinationCheck === 'NONE' ? undefined : form.vaccinationCheck,
  location: form.location,
  specialMark: form.specialMark,
  contacts: form.contact.map((c) => ({ type: c.type, value: c.value })),
  tags: [],
  likes: form.likes || undefined,
  dislikes: form.dislikes || undefined,
  health: form.health || undefined,
  relatedLink: form.relatedLink || undefined,
  images: uploadedImageUrls
});

export const createAdoptionPersonal = async (body: CreateAdoptionPersonalBody): Promise<CommunityAdoptDetailDto> => {
  const res: AxiosResponse<ApiResponse<unknown>> = await authApi.post(`${BASE}/adoption-personal`, body);
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

export const updateAdoptionPersonal = async (
  id: number,
  body: CreateAdoptionPersonalBody
): Promise<CommunityAdoptDetailDto> => {
  const res: AxiosResponse<ApiResponse<unknown>> = await authApi.patch(`${BASE}/adoption-personal/${id}`, body);
  return CommunityAdoptDetailSchema.parse(res.data.data);
};
