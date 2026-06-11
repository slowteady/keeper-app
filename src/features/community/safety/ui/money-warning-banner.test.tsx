import { render, screen } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { MoneyWarningBanner } from './money-warning-banner';

describe('MoneyWarningBanner', () => {
  it('금전 요구 제재 문구를 렌더한다', () => {
    render(<MoneyWarningBanner />, { wrapper: createWrapper() });

    expect(screen.getByText(/금전을 요구받으면 신고해주세요/)).toBeTruthy();
    expect(screen.getByText(/금전을 주고받는 입양을 금지/)).toBeTruthy();
  });
});
