import { atom } from 'jotai';

import type { AgreementState } from '../../signup/ui';

export type LoginStep = 'social' | 'agreement';

export type LoginSheetState = {
  step: LoginStep;
  signupToken: string | null;
  agreements: AgreementState;
};

export const INITIAL_LOGIN_SHEET: LoginSheetState = {
  step: 'social',
  signupToken: null,
  agreements: { age14: false, terms: false, privacy: false, community: false }
};

export const loginSheetAtom = atom<LoginSheetState>(INITIAL_LOGIN_SHEET);
