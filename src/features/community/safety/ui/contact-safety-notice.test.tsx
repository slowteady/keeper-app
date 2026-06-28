import { render, screen } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { ContactSafetyNotice } from './contact-safety-notice';

describe('ContactSafetyNotice', () => {
  it('면책·금전 고지 문구를 렌더한다', () => {
    render(<ContactSafetyNotice />, { wrapper: createWrapper() });

    expect(screen.getByText(/keeper는 입양에 관여하지 않으며/)).toBeTruthy();
    expect(screen.getByText(/금전을 요구받으면 신고해주세요/)).toBeTruthy();
  });
});
