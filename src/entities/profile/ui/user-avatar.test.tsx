import { render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('이미지가 있고 로딩 아님 → 이미지 렌더, 스켈레톤 없음', () => {
    const { getByTestId, queryByTestId } = render(<UserAvatar image="https://x.jpg" />, { wrapper: createWrapper() });
    expect(getByTestId('user-avatar-image')).toBeTruthy();
    expect(queryByTestId('user-avatar-skeleton')).toBeNull();
  });

  it('로딩 중 → 스켈레톤 렌더, 이미지 없음', () => {
    const { getByTestId, queryByTestId } = render(<UserAvatar image="https://x.jpg" loading />, {
      wrapper: createWrapper()
    });
    expect(getByTestId('user-avatar-skeleton')).toBeTruthy();
    expect(queryByTestId('user-avatar-image')).toBeNull();
  });

  it('이미지 없음 → 이미지 미렌더(EmptyAvatar)', () => {
    const { queryByTestId } = render(<UserAvatar image={null} />, { wrapper: createWrapper() });
    expect(queryByTestId('user-avatar-image')).toBeNull();
  });
});
