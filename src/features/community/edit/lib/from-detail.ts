import { CommunityAdoptDetailDto, CommunityAdoptFormDto } from '@/entities/community';
import { GenderDto } from '@/shared/model';

export const fromAdoptionPersonalDetail = (detail: CommunityAdoptDetailDto): CommunityAdoptFormDto => ({
  title: detail.title,
  animalType: detail.animalType,
  specificType: detail.specificType,
  images: detail.images,
  gender: detail.gender as GenderDto,
  neuterYn: detail.neuterYn,
  healthCheck: detail.healthCheck ?? 'NONE',
  age: detail.age,
  weight: detail.weight,
  location: detail.location,
  specialMark: detail.specialMark ?? '',
  content: detail.content ?? '',
  contact: detail.contacts.map((c) => ({ type: c.type, value: c.value })),
  likes: detail.likes ?? '',
  dislikes: detail.dislikes ?? '',
  health: detail.health ?? '',
  relatedLink: detail.relatedLink ?? '',
  protectionType: detail.protectionType,
  vaccinationCheck: detail.vaccinationCheck ?? 'NONE'
});
