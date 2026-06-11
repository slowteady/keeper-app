import { render, screen } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { DisclaimerNotice } from './disclaimer-notice';

describe('DisclaimerNotice', () => {
  it('면책 고지 문구를 렌더한다', () => {
    render(<DisclaimerNotice />, { wrapper: createWrapper() });

    expect(screen.getByText(/keeper는 입양을 잇는 공간이에요/)).toBeTruthy();
    expect(screen.getByText(/책임은 게시자와 입양자에게 있어요/)).toBeTruthy();
  });
});
