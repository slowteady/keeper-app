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
  regionCode?: string;
  health?: string;
  relatedLink?: string;
  toiletTraining?: CommunityAdoptFormDto['toiletTraining'];
  separationAnxiety?: CommunityAdoptFormDto['separationAnxiety'];
  barking?: CommunityAdoptFormDto['barking'];
  activityLevel?: CommunityAdoptFormDto['activityLevel'];
  withChildren?: CommunityAdoptFormDto['withChildren'];
  withDogs?: CommunityAdoptFormDto['withDogs'];
  withCats?: CommunityAdoptFormDto['withCats'];
};

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
  regionCode: orUndefined(form.regionCode),
  health: orUndefined(form.health),
  relatedLink: orUndefined(form.relatedLink),
  toiletTraining: orUndefined(form.toiletTraining),
  separationAnxiety: orUndefined(form.separationAnxiety),
  barking: orUndefined(form.barking),
  activityLevel: orUndefined(form.activityLevel),
  withChildren: orUndefined(form.withChildren),
  withDogs: orUndefined(form.withDogs),
  withCats: orUndefined(form.withCats)
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
