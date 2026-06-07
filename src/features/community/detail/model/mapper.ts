import { convertGenderLabel, formatAge } from '@/entities/adopt/mapper';
import { buildAdoptTags, CommunityAdoptDetailDto } from '@/entities/community';

export const convertToAdoptDetailOverviewData = (detailPost: CommunityAdoptDetailDto) => {
  return {
    id: detailPost.id,
    image: detailPost.user?.image ?? '',
    nickname: detailPost.user?.nickname ?? '탈퇴한 사용자',
    displayTime: detailPost.displayTime,
    title: detailPost.title,
    images: detailPost.images,
    tags: buildAdoptTags(detailPost),
    content: detailPost.content ?? '',
    isLiked: detailPost.isLiked
  };
};

// 공고 상세(adopt mapper) 와 동일 포맷팅 — 같은 InfoSection 컴포넌트에 같은 표시 보장.
export const convertToAdoptDetailInfoData = (detailPost: CommunityAdoptDetailDto) => {
  return {
    age: formatAge(detailPost.age ?? undefined) ?? '미상',
    gender: convertGenderLabel(detailPost.gender ?? undefined),
    weight: formatWeight(detailPost.weight ?? undefined),
    healthCheck: detailPost.healthCheck ?? undefined,
    neuterYn: detailPost.neuterYn ?? undefined,
    vaccinationCheck: detailPost.vaccinationCheck ?? undefined
  };
};

// adopt mapper 의 formatWeight 와 동일 (community schema 는 string).
// `4kg` 처럼 단위 포함 입력 / 숫자만 / 빈 값 모두 정제.
const formatWeight = (weight?: string): string => {
  if (!weight) return '미상';
  const num = parseFloat(weight);
  if (Number.isNaN(num)) return '미상';
  const cleaned = num.toFixed(1).replace(/\.0$/, '');
  return `${cleaned}kg`;
};

export const convertToAdoptDetailDescriptionData = (detailPost: CommunityAdoptDetailDto) => {
  return {
    specialMark: detailPost.specialMark ?? '',
    likes: detailPost.likes ?? '',
    dislikes: detailPost.dislikes ?? '',
    health: detailPost.health ?? '',
    relatedLink: detailPost.relatedLink ?? ''
  };
};
