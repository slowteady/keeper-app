import { useCallback, useState } from 'react';

import { QnaSortDto, QnaTypeDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';

// list 필터의 카테고리 — '전체' 포함 (default). 개인입양 동물 ButtonGroup 과 동일하게 항상 선택 유지
export type QnaCategoryFilter = 'ALL' | QnaTypeDto;

// QnA list 의 chip·정렬 상태. 카테고리·동물 '전체' default, 정렬 최신순 default
export const useCommunityQnaFilter = () => {
  const [qnaType, setQnaType] = useState<QnaCategoryFilter>('ALL');
  const [animalType, setAnimalType] = useState<AnimalTypeDto>('ALL');
  const [sort, setSort] = useState<QnaSortDto>('NEW');

  const changeQnaType = useCallback((next: QnaCategoryFilter) => {
    setQnaType(next);
  }, []);

  const changeAnimalType = useCallback((next: AnimalTypeDto) => {
    setAnimalType(next);
  }, []);

  const changeSort = useCallback((next: QnaSortDto) => {
    setSort(next);
  }, []);

  return { qnaType, animalType, sort, changeQnaType, changeAnimalType, changeSort };
};
