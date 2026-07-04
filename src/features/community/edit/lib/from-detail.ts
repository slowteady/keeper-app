import { CommunityAdoptDetailDto, CommunityAdoptFormDto } from '@/entities/community';

const orUndefined = <T>(value: T | 'NONE' | null | undefined): T | undefined =>
  value === 'NONE' || value === null || value === undefined ? undefined : (value as T);

export const fromAdoptionPersonalDetail = (detail: CommunityAdoptDetailDto): CommunityAdoptFormDto => ({
  animalType: detail.animalType,
  protectionType: detail.protectionType,
  title: detail.title,
  content: detail.content ?? '',
  images: detail.images,
  video:
    detail.videoUrl && detail.videoThumbnailUrl
      ? { uri: detail.videoUrl, thumbnailUri: detail.videoThumbnailUrl, duration: detail.videoDuration ?? 0 }
      : null,
  contact: detail.contacts.map((c) => ({ type: c.type, value: c.value })),
  specificType: orUndefined(detail.specificType),
  gender: detail.gender === 'M' || detail.gender === 'F' ? detail.gender : undefined,
  neuterYn: orUndefined(detail.neuterYn),
  healthCheck: orUndefined(detail.healthCheck),
  vaccinationCheck: orUndefined(detail.vaccinationCheck),
  age: orUndefined(detail.age),
  weight: orUndefined(detail.weight),
  location: detail.location?.trim() || '',
  health: orUndefined(detail.health),
  relatedLink: orUndefined(detail.relatedLink),
  toiletTraining: orUndefined(detail.toiletTraining),
  separationAnxiety: orUndefined(detail.separationAnxiety),
  barking: orUndefined(detail.barking),
  activityLevel: orUndefined(detail.activityLevel),
  withChildren: orUndefined(detail.withChildren),
  withDogs: orUndefined(detail.withDogs),
  withCats: orUndefined(detail.withCats)
});
