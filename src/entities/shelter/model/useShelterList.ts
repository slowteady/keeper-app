import { useLocalSearchParams } from 'expo-router';

export const useShelterList = () => {
  const params = useLocalSearchParams<{ search?: string }>();
};
