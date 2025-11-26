import { TDetailPostDto } from '@/entities';

export const getSectionData = (detailPost: TDetailPostDto) => {
  const overviewData = {
    id: detailPost.id,
    image: detailPost.user.image,
    nickname: detailPost.user.nickname,
    displayTime: detailPost.displayTime,
    title: detailPost.title,
    images: detailPost.images,
    tags: detailPost.tags,
    content: detailPost.content
  };

  const infoData = {
    age: detailPost.age,
    gender: detailPost.gender === 'M' ? '남아' : '여아',
    weight: detailPost.weight + 'kg',
    healthCheck: detailPost.healthCheck,
    neuterYn: detailPost.neuterYn,
    vaccinationCheck: detailPost.vaccinationCheck
  };

  const descriptionData = {
    specialMark: detailPost.specialMark,
    likes: detailPost.likes,
    dislikes: detailPost.dislikes,
    health: detailPost.health,
    relatedLink: detailPost.relatedLink
  };

  return {
    overviewData,
    infoData,
    descriptionData
  };
};
