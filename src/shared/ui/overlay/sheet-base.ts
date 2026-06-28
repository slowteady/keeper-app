import type { ComponentType, ReactNode } from 'react';
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

// iOS fullScreenModal native vc 위에 BottomSheet portal 표시 — react-native-screens 의 FullWindowOverlay 로 감싸야 함
// (@gorhom/bottom-sheet types.d.ts 권장 BP, issue #832)
export const SheetContainer =
  Platform.OS === 'ios' ? (FullWindowOverlay as ComponentType<{ children?: ReactNode }>) : undefined;

export const SHEET_BACKGROUND_STYLE = { borderTopLeftRadius: 20, borderTopRightRadius: 20 };

export const sheetHandleIndicatorStyle = (color: string) => ({
  width: 48,
  borderRadius: 30,
  backgroundColor: color
});
