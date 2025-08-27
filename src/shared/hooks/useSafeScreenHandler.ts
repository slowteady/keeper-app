import { useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { useEffect } from 'react';
import { safeScreenAtom, SafeScreenConfig, updateSafeScreenAtom } from '../components';

export const useSafeScreenHandler = (config: Partial<SafeScreenConfig>) => {
  const updateSafeScreen = useSetAtom(updateSafeScreenAtom);
  const resetSafeScreen = useResetAtom(safeScreenAtom);

  useEffect(() => {
    updateSafeScreen(config);
    return () => resetSafeScreen();
  }, [config, updateSafeScreen, resetSafeScreen]);
};
