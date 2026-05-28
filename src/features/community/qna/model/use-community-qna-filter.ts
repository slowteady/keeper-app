import { useCallback, useState } from 'react';

import { QnaTypeDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';

// QnA list 의 chip 상태. 둘 다 미선택 가능 (default = 전체)
export const useCommunityQnaFilter = () => {
  const [type, setType] = useState<QnaTypeDto | undefined>(undefined);
  const [animalType, setAnimalType] = useState<AnimalTypeDto | undefined>(undefined);

  // chip 다시 누르면 해제 (toggle), 다른 chip 누르면 갱신
  const toggleType = useCallback((next: QnaTypeDto) => {
    setType((prev) => (prev === next ? undefined : next));
  }, []);

  const toggleAnimalType = useCallback((next: AnimalTypeDto) => {
    setAnimalType((prev) => (prev === next ? undefined : next));
  }, []);

  return { type, animalType, toggleType, toggleAnimalType };
};
