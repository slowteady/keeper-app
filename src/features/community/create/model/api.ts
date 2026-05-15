import { AxiosResponse } from 'axios';

import { CommunityAdoptDetailDto, CommunityAdoptDetailSchema, CommunityAdoptFormDto } from '@/entities/community';
import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

const BASE = '/community/posts';

// 백엔드 PostAdoptionPersonalRequest 와 매핑되는 body
// - contact(단수) → contacts(복수)
// - vaccinationCheck NONE 은 옵셔널 → undefined 로 송신 (백엔드 enum 매핑 회피)
// - tags 는 빈 배열로 (백엔드 @IsArray() 필수 — 라벨 변환은 응답 측 mapper 책임)
// - images 는 이미 업로드된 publicUrl 배열을 받는다 (handleSubmit 에서 presigned 후 전달)
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
