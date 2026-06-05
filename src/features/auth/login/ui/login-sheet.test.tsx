import { render, screen } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { LoginSheetView } from './login-sheet';

describe('LoginSheetView', () => {
  it('카카오 버튼과 약관 고지를 렌더한다', () => {
    render(<LoginSheetView onResponse={jest.fn()} isGoogleAvailable={false} isAppleAvailable={false} />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('카카오로 계속하기')).toBeTruthy();
    expect(screen.getByText(/이용약관/)).toBeTruthy();
  });

  it('isGoogleAvailable·isAppleAvailable 가 true면 구글·애플 버튼도 렌더한다', () => {
    render(<LoginSheetView onResponse={jest.fn()} isGoogleAvailable isAppleAvailable />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Google로 계속하기')).toBeTruthy();
    expect(screen.getByText('Apple로 계속하기')).toBeTruthy();
  });

  it('false면 구글·애플 버튼을 숨긴다', () => {
    render(<LoginSheetView onResponse={jest.fn()} isGoogleAvailable={false} isAppleAvailable={false} />, {
      wrapper: createWrapper()
    });

    expect(screen.queryByText('Google로 계속하기')).toBeNull();
    expect(screen.queryByText('Apple로 계속하기')).toBeNull();
  });
});
