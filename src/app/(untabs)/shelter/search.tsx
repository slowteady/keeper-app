import { router } from 'expo-router';
import { useCallback } from 'react';

import { ShelterSearchScreen, useSetShelterSearchCoord } from '@/features/shelter';

const SearchPage = () => {
  const setSearchCoord = useSetShelterSearchCoord();

  const handleSelect = useCallback(
    (coord: { latitude: number; longitude: number }) => {
      setSearchCoord(coord);
      router.back();
    },
    [setSearchCoord]
  );

  return <ShelterSearchScreen onClose={() => router.back()} onSelect={handleSelect} />;
};

export default SearchPage;
