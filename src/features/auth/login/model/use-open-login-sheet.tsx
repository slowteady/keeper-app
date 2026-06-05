import { Route } from 'expo-router';
import { useCallback } from 'react';

import { useBottomSheet } from '@/shared/ui';

import { LoginSheet } from '../ui/login-sheet-container';

// 로그인 시트 = 고정 높이(content swap: social↔agreement, 높이 변동 0)
const LOGIN_SHEET_SNAP_POINTS = ['62%'];

export const useOpenLoginSheet = () => {
  const { present } = useBottomSheet();

  return useCallback(
    (redirect?: Route) => {
      present(<LoginSheet redirect={redirect} />, { snapPoints: LOGIN_SHEET_SNAP_POINTS });
    },
    [present]
  );
};
