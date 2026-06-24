import { useCallback, useState } from 'react';

import { QnaSortDto, QnaTypeDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';

export type QnaCategoryFilter = 'ALL' | QnaTypeDto;

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
