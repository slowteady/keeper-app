import { render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { MissingCard } from './missing-card';

jest.mock('react-native-gesture-handler', () => {
  const chainable = () => {
    const g: Record<string, () => unknown> = {};
    ['maxDuration', 'maxDeltaX', 'maxDeltaY', 'enabled', 'onEnd', 'runOnJS'].forEach((m) => {
      g[m] = () => g;
    });
    return g;
  };
  return {
    Gesture: { Tap: chainable },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children
  };
});

const BASE = { uri: 'https://img/a.jpg', kind: '말티즈', region: '서울특별시 강남구', date: '2026.07.01' };

describe('MissingCard status', () => {
  it('RESOLVED 면 찾음 칩을 보여준다', () => {
    const { getByText } = render(<MissingCard {...BASE} status="RESOLVED" />, { wrapper: createWrapper() });
    expect(getByText('찾음')).toBeTruthy();
  });

  it('MISSING 이면 찾음 칩을 숨긴다', () => {
    const { queryByText } = render(<MissingCard {...BASE} status="MISSING" />, { wrapper: createWrapper() });
    expect(queryByText('찾음')).toBeNull();
  });
});
