import { fireEvent, render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { ConfirmDeleteModal } from './confirm-delete-modal';

describe('ConfirmDeleteModal', () => {
  it('닫기 버튼 탭 시 onCancel 호출', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    const { getByText } = render(<ConfirmDeleteModal onCancel={onCancel} onConfirm={onConfirm} />, {
      wrapper: createWrapper()
    });

    fireEvent.press(getByText('닫기'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('삭제하기 버튼 탭 시 onConfirm 호출', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    const { getByText } = render(<ConfirmDeleteModal onCancel={onCancel} onConfirm={onConfirm} />, {
      wrapper: createWrapper()
    });

    fireEvent.press(getByText('삭제하기'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('기본 description "*내가 쓴 글이 완전히 삭제됩니다." 노출', () => {
    const { getByText } = render(<ConfirmDeleteModal onCancel={jest.fn()} onConfirm={jest.fn()} />, {
      wrapper: createWrapper()
    });
    expect(getByText('*내가 쓴 글이 완전히 삭제됩니다.')).toBeTruthy();
  });

  it('description prop override 시 그 값으로 노출', () => {
    const { getByText } = render(
      <ConfirmDeleteModal
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        description="*내가 쓴 댓글이 완전히 삭제됩니다."
      />,
      { wrapper: createWrapper() }
    );
    expect(getByText('*내가 쓴 댓글이 완전히 삭제됩니다.')).toBeTruthy();
  });
});
