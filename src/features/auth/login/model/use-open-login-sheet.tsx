import { useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { useBottomSheet } from '@/shared/ui';

import { LoginSheet } from '../ui/login-sheet-container';
import { INITIAL_LOGIN_SHEET, loginSheetAtom } from './login-sheet-atom';

const LOGIN_SHEET_SNAP_POINTS = ['52%'];

export const useOpenLoginSheet = () => {
  const { present } = useBottomSheet();
  const resetSheet = useSetAtom(loginSheetAtom);

  return useCallback(() => {
    resetSheet(INITIAL_LOGIN_SHEET);
    present(<LoginSheet />, { snapPoints: LOGIN_SHEET_SNAP_POINTS });
  }, [present, resetSheet]);
};
