import { useCallback, useState } from 'react';

import { QnaTypeDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';

// list 필터의 카테고리 — '전체' 포함 (default). 개인입양 동물 ButtonGroup 과 동일하게 항상 선택 유지
export type QnaCategoryFilter = 'ALL' | QnaTypeDto;

// QnA list 의 chip 상태. 카테고리·동물 둘 다 '전체' default (개인입양 패턴 일관)
export const useCommunityQnaFilter = () => {
  const [qnaType, setQnaType] = useState<QnaCategoryFilter>('ALL');
  const [animalType, setAnimalType] = useState<AnimalTypeDto>('ALL');

  const changeQnaType = useCallback((next: QnaCategoryFilter) => {
    setQnaType(next);
  }, []);

  const changeAnimalType = useCallback((next: AnimalTypeDto) => {
    setAnimalType(next);
  }, []);

  return { qnaType, animalType, changeQnaType, changeAnimalType };
};
