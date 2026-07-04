import { convertGenderLabel, formatAge } from '@/entities/adopt/mapper';
import { CommunityAdoptDetailDto, CREATE_POST_OPTIONS } from '@/entities/community';

export type BehaviorItem = { label: string; value: string };

const animalTypeLabel = (value?: string | null) =>
  CREATE_POST_OPTIONS.animalType.find((o) => o.value === value)?.label ?? '';

export const convertToAdoptDetailOverviewData = (detailPost: CommunityAdoptDetailDto) => {
  const breed = detailPost.specificType?.trim();
  return {
    id: detailPost.id,
    image: detailPost.user?.image ?? '',
    nickname: detailPost.user?.nickname ?? '탈퇴한 사용자',
    displayTime: detailPost.displayTime,
    title: detailPost.title,
    images: detailPost.images,
    videoUrl: detailPost.videoUrl ?? null,
    videoThumbnailUrl: detailPost.videoThumbnailUrl ?? null,
    breed: breed || animalTypeLabel(detailPost.animalType),
    region: detailPost.location?.trim() || '',
    protectionType: detailPost.protectionType ?? null,
    content: detailPost.content ?? '',
    isLiked: detailPost.isLiked
  };
};

export const convertToAdoptDetailInfoData = (detailPost: CommunityAdoptDetailDto) => {
  return {
    age: formatAge(detailPost.age ?? undefined) ?? '모름',
    gender: convertGenderLabel(detailPost.gender ?? undefined),
    weight: formatWeight(detailPost.weight ?? undefined),
    healthCheck: detailPost.healthCheck ?? undefined,
    neuterYn: detailPost.neuterYn ?? undefined,
    vaccinationCheck: detailPost.vaccinationCheck ?? undefined
  };
};

const formatWeight = (weight?: string): string => {
  if (!weight) return '모름';
  const num = parseFloat(weight);
  if (Number.isNaN(num)) return '모름';
  const cleaned = num.toFixed(1).replace(/\.0$/, '');
  return `${cleaned}kg`;
};

export const convertToAdoptDetailDescriptionData = (detailPost: CommunityAdoptDetailDto) => {
  return {
    health: detailPost.health ?? '',
    relatedLink: detailPost.relatedLink ?? ''
  };
};

export const convertToAdoptDetailBehaviorData = (detailPost: CommunityAdoptDetailDto): BehaviorItem[] => {
  const lookup = (options: readonly { value: string; label: string }[], v: string | null | undefined) =>
    options.find((o) => o.value === v)?.label;

  const items: BehaviorItem[] = [];
  const add = (label: string, options: readonly { value: string; label: string }[], v: string | null | undefined) => {
    const found = lookup(options, v);
    if (found) items.push({ label, value: found });
  };

  add('배변훈련', CREATE_POST_OPTIONS.toiletTraining, detailPost.toiletTraining);
  add('혼자 있기', CREATE_POST_OPTIONS.separationAnxiety, detailPost.separationAnxiety);
  add('짖음', CREATE_POST_OPTIONS.barking, detailPost.barking);
  add('활동량', CREATE_POST_OPTIONS.activityLevel, detailPost.activityLevel);
  add('아이와', CREATE_POST_OPTIONS.socialCompatibility, detailPost.withChildren);
  add('강아지와', CREATE_POST_OPTIONS.socialCompatibility, detailPost.withDogs);
  add('고양이와', CREATE_POST_OPTIONS.socialCompatibility, detailPost.withCats);

  return items;
};
