import { render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { StatusChip, StatusDimOverlay } from './status-overlay';

describe('StatusDimOverlay', () => {
  it('testID 로 렌더한다', () => {
    const { getByTestId } = render(<StatusDimOverlay testID="dim" />, { wrapper: createWrapper() });
    expect(getByTestId('dim')).toBeTruthy();
  });
});

describe('StatusChip', () => {
  it('라벨을 렌더한다', () => {
    const { getByText } = render(<StatusChip label="찾음" />, { wrapper: createWrapper() });
    expect(getByText('찾음')).toBeTruthy();
  });
});
