import { CommunityQnaDetailDto, QNA_ANIMAL_TYPE_OPTIONS, QNA_CATEGORY_OPTIONS } from '@/entities/community';

export const convertToQnaDetailOverviewData = (qna: CommunityQnaDetailDto) => {
  const categoryLabel = QNA_CATEGORY_OPTIONS.find((o) => o.value === qna.qnaType)?.label;
  const animalLabel = QNA_ANIMAL_TYPE_OPTIONS.find((o) => o.value === qna.animalType)?.label;
  const tags = [categoryLabel, animalLabel].filter((v) => !!v) as string[];

  return {
    id: qna.id,
    image: qna.user?.image ?? '',
    nickname: qna.user?.nickname ?? '탈퇴한 사용자',
    displayTime: qna.displayTime,
    title: qna.title,
    images: qna.images,
    tags,
    content: qna.content,
    isLiked: qna.isLiked
  };
};
