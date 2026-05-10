import { CommunityAdoptDetailDto } from '@/entities/community';

export const convertToAdoptDetailOverviewData = (detailPost: CommunityAdoptDetailDto) => {
  return {
    id: detailPost.id,
    image: detailPost.user?.image ?? '',
    nickname: detailPost.user?.nickname ?? '탈퇴한 사용자',
    displayTime: detailPost.displayTime,
    title: detailPost.title,
    images: detailPost.images,
    tags: detailPost.tags,
    content: detailPost.content ?? ''
  };
};

export const convertToAdoptDetailInfoData = (detailPost: CommunityAdoptDetailDto) => {
  return {
    age: detailPost.age,
    gender: detailPost.gender === 'M' ? '남아' : '여아',
    weight: detailPost.weight + 'kg',
    healthCheck: detailPost.healthCheck,
    neuterYn: detailPost.neuterYn,
    vaccinationCheck: detailPost.vaccinationCheck
  };
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
