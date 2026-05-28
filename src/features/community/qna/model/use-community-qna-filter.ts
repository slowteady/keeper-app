import { useCallback, useState } from 'react';

import { QnaTypeDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';

// QnA list 의 chip 상태. 둘 다 미선택 가능 (default = 전체)
export const useCommunityQnaFilter = () => {
  const [qnaType, setQnaType] = useState<QnaTypeDto | undefined>(undefined);
  const [animalType, setAnimalType] = useState<AnimalTypeDto | undefined>(undefined);

  const toggleQnaType = useCallback((next: QnaTypeDto) => {
    setQnaType((prev) => (prev === next ? undefined : next));
  }, []);

  const toggleAnimalType = useCallback((next: AnimalTypeDto) => {
    setAnimalType((prev) => (prev === next ? undefined : next));
  }, []);

  return { qnaType, animalType, toggleQnaType, toggleAnimalType };
};
