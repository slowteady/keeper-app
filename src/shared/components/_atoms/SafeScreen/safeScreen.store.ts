import { atom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

export interface SafeScreenConfig {
  useSafeArea: boolean;
  safeTop: boolean;
  safeBottom: boolean;
  customTopPadding?: number;
  customBottomPadding?: number;
}

const defaultConfig: SafeScreenConfig = {
  useSafeArea: true,
  safeTop: true,
  safeBottom: true,
  customTopPadding: undefined,
  customBottomPadding: undefined
};

export const safeScreenAtom = atomWithReset<SafeScreenConfig>(defaultConfig);

export const updateSafeScreenAtom = atom(null, (get, set, updates: Partial<SafeScreenConfig>) => {
  set(safeScreenAtom, { ...get(safeScreenAtom), ...updates });
});
