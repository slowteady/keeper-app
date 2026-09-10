import { GENDER_VALUES, MissingContactItemDto, MissingCreateFormDto, MissingDetailDto } from '@/entities/missing';

const asGender = (value: string | null): MissingCreateFormDto['gender'] => {
  const found = GENDER_VALUES.find((item) => item === value);
  return found ?? undefined;
};

export const fromMissingDetail = (
  detail: MissingDetailDto,
  contacts: MissingContactItemDto[]
): MissingCreateFormDto => ({
  images: detail.images,
  video: detail.videoUrl
    ? {
        uri: detail.videoUrl,
        thumbnailUri: detail.videoThumbnailUrl ?? '',
        duration: detail.videoDuration ?? 0
      }
    : null,
  animalType: detail.animalType,
  colorFeature: detail.colorFeature,
  description: detail.description ?? undefined,
  lostAt: detail.lostAt,
  address: detail.address,
  lat: detail.lat,
  lng: detail.lng,
  regionCode: detail.regionCode,
  name: detail.name ?? '',
  gender: asGender(detail.gender),
  specificType: detail.breed ?? '',
  age: detail.age ?? undefined,
  weight: detail.weight ?? undefined,
  hasIdTag: detail.hasIdTag ?? 'N',
  rfid: detail.rfid ?? undefined,
  contact: contacts.map(({ type, value }) => ({ type, value }))
});
