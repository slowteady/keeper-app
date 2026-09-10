import { MissingCreateBody, MissingCreateFormDto } from '@/entities/missing';
import { ResolvedVideo } from '@/features/upload';

const trimmed = (value?: string): string | undefined => {
  const next = value?.trim();
  return next ? next : undefined;
};

export const toMissingCreateBody = (
  form: MissingCreateFormDto,
  images: string[],
  video?: ResolvedVideo | null
): MissingCreateBody => ({
  animalType: form.animalType,
  colorFeature: form.colorFeature,
  description: trimmed(form.description),
  lostAt: form.lostAt,
  lat: form.lat,
  lng: form.lng,
  address: form.address,
  regionCode: form.regionCode ?? null,
  name: form.name.trim(),
  gender: form.gender,
  breed: form.specificType.trim(),
  age: trimmed(form.age),
  weight: trimmed(form.weight),
  hasIdTag: form.hasIdTag,
  rfid: trimmed(form.rfid),
  contacts: form.contact.map(({ type, value }) => ({ type, value: value.trim() })),
  images,
  videoUrl: video?.videoUrl,
  videoThumbnailUrl: video?.videoThumbnailUrl,
  videoDuration: video?.videoDuration
});
