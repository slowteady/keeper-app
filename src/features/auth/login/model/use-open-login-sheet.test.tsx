import { act, renderHook } from '@testing-library/react-native';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { INITIAL_LOGIN_SHEET, loginSheetAtom } from './login-sheet-atom';
import { useOpenLoginSheet } from './use-open-login-sheet';

const mockPresent = jest.fn();
jest.mock('@/shared/ui', () => ({
  ...jest.requireActual('@/shared/ui'),
  useBottomSheet: () => ({ present: mockPresent })
}));

describe('useOpenLoginSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('시트를 열 때 loginSheetAtom 을 초기 상태로 리셋한다', () => {
    const store = createStore();
    store.set(loginSheetAtom, {
      step: 'agreement',
      signupToken: 'st',
      agreements: { age14: true, terms: true, privacy: true, community: true }
    });

    const { result } = renderHook(() => useOpenLoginSheet(), {
      wrapper: ({ children }: { children: ReactNode }) => <JotaiProvider store={store}>{children}</JotaiProvider>
    });

    act(() => result.current());

    expect(store.get(loginSheetAtom)).toEqual(INITIAL_LOGIN_SHEET);
    expect(mockPresent).toHaveBeenCalled();
  });
});
