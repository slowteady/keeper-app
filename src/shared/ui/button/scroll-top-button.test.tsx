import { fireEvent, render } from '@testing-library/react-native';

import { ScrollToTopButton } from './scroll-top-button';

jest.mock('@/shared/ui/icons/etc', () => ({ ScrollButton: () => null }));

describe('ScrollToTopButton', () => {
  it('렌더되고 testID 노출', () => {
    const { getByTestId } = render(
      <ScrollToTopButton scrollY={{ value: 0 } as never} onPress={jest.fn()} threshold={600} />
    );
    expect(getByTestId('scroll-to-top')).toBeTruthy();
  });

  it('임계값보다 아래로 스크롤된 상태(노출 전)면 눌러도 onPress 미호출', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ScrollToTopButton scrollY={{ value: 100 } as never} onPress={onPress} threshold={600} />
    );
    fireEvent.press(getByTestId('scroll-to-top'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('임계값보다 더 내려간 상태(노출)면 누르면 onPress 호출', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ScrollToTopButton scrollY={{ value: 800 } as never} onPress={onPress} threshold={600} />
    );
    fireEvent.press(getByTestId('scroll-to-top'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
