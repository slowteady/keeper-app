import { fireEvent, render } from '@testing-library/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createWrapper } from '@/test/create-wrapper';

import { ModalPageHeader } from './modal-page-header';

const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<typeof useSafeAreaInsets>;

describe('ModalPageHeader', () => {
  beforeEach(() => {
    mockedUseSafeAreaInsets.mockReturnValue({ top: 50, bottom: 0, left: 0, right: 0 });
  });

  it('fullScreen=true 면 status bar inset 반영 (height = 44 + insets.top + 10)', () => {
    const { getByTestId } = render(<ModalPageHeader fullScreen />, { wrapper: createWrapper() });
    const wrap = getByTestId('modal-page-header');

    expect(wrap).toHaveStyle({ height: 44 + (50 + 10), paddingTop: 50 + 10 });
  });

  it('fullScreen=false (기본) 면 pt=8 작은 padding (height = 44 + 8)', () => {
    const { getByTestId } = render(<ModalPageHeader />, { wrapper: createWrapper() });
    const wrap = getByTestId('modal-page-header');

    expect(wrap).toHaveStyle({ height: 44 + 8, paddingTop: 8 });
  });

  it('close 버튼 탭 시 onClose 호출', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<ModalPageHeader onClose={onClose} />, { wrapper: createWrapper() });

    fireEvent.press(getByTestId('modal-page-header-close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('title prop 노출', () => {
    const { getByText } = render(<ModalPageHeader title="개인입양 홍보" />, { wrapper: createWrapper() });
    expect(getByText('개인입양 홍보')).toBeTruthy();
  });
});
