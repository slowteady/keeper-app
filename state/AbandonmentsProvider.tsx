import { AbandonmentsFilter } from '@/type/abandonments';
import { AnimalType } from '@/type/common';
import { createContext, useContext, useState } from 'react';

export interface AbandonmentsContextProps {
  animalType: AnimalType;
  setAnimalType: (type: AnimalType) => void;
  filter: AbandonmentsFilter;
  setFilter: (filter: AbandonmentsFilter) => void;
  page: number;
  setPage: (page: number) => void;
}
export interface AbandonmentsProviderProps {
  children: React.ReactNode;
}
const AbandonmentsContext = createContext<Partial<AbandonmentsContextProps> | undefined>(undefined);

export const useAbandonmentsContext = () => {
  const context = useContext(AbandonmentsContext);
  if (!context) {
    throw new Error('useAbandonmentsContext must be used within a AbandonmentsProvider');
  }
  return context;
};

export const AbandonmentsProvider = ({ children }: AbandonmentsProviderProps) => {
  const [animalType, setAnimalType] = useState<AnimalType>('ALL');
  const [filter, setFilter] = useState<AbandonmentsFilter>('NEAR_DEADLINE');
  const [page, setPage] = useState<number>(1);

  const value: Partial<AbandonmentsContextProps> = {
    animalType,
    setAnimalType,
    filter,
    setFilter,
    page,
    setPage
  };

  return <AbandonmentsContext.Provider value={value}>{children}</AbandonmentsContext.Provider>;
};
