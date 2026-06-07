import { useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { useBottomSheet } from '@/shared/ui';

import { LoginSheet } from '../ui/login-sheet-container';
import { INITIAL_LOGIN_SHEET, loginSheetAtom } from './login-sheet-atom';

export const useOpenLoginSheet = () => {
  const { present } = useBottomSheet();
  const resetSheet = useSetAtom(loginSheetAtom);

  return useCallback(() => {
    resetSheet(INITIAL_LOGIN_SHEET);
    present(<LoginSheet />, { enableDynamicSizing: true });
  }, [present, resetSheet]);
};
