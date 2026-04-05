import { atom } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import { ViewProps } from 'tamagui';

export type SafeScreenConfig = {
  useSafeArea?: boolean;
  safeTop?: boolean;
  safeBottom?: boolean;
  customTopPadding?: number;
  customBottomPadding?: number;
  ContainerProps?: ViewProps;
};

const defaultConfig: SafeScreenConfig = {
  useSafeArea: true,
  safeTop: true,
  safeBottom: true,
  customTopPadding: undefined,
  customBottomPadding: undefined,
  ContainerProps: {}
};

export const safeScreenAtom = atomWithReset<SafeScreenConfig>(defaultConfig);

export const updateSafeScreenAtom = atom(null, (get, set, updates: Partial<SafeScreenConfig>) => {
  set(safeScreenAtom, { ...get(safeScreenAtom), ...updates });
});
