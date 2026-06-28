import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export const useRefetchOnFocus = (refetch: () => unknown, enabled = true) => {
  useFocusEffect(
    useCallback(() => {
      if (enabled) refetch();
    }, [refetch, enabled])
  );
};
