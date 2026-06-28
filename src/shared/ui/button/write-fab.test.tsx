import { fireEvent, render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { WriteFab } from './write-fab';

jest.mock('@tamagui/lucide-icons', () => ({ Plus: () => null }));

describe('WriteFab', () => {
  it('라벨과 testID 를 렌더한다', () => {
    const { getByText, getByTestId } = render(
      <WriteFab label="글 올리기" onPress={jest.fn()} scrollY={{ value: 0 } as never} testID="community-write-fab" />,
      { wrapper: createWrapper() }
    );
    expect(getByText('글 올리기')).toBeTruthy();
    expect(getByTestId('community-write-fab')).toBeTruthy();
  });

  it('누르면 onPress 가 호출된다', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <WriteFab label="공고 올리기" onPress={onPress} scrollY={{ value: 0 } as never} testID="adopt-write-fab" />,
      { wrapper: createWrapper() }
    );
    fireEvent.press(getByTestId('adopt-write-fab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
