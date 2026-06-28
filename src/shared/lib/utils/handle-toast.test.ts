import { toast as sonnerToast } from 'sonner-native';

import { globalToast } from './handle-toast';

jest.mock('sonner-native', () => ({
  toast: { custom: jest.fn() }
}));

const customMock = sonnerToast.custom as jest.Mock;

describe('handle-toast', () => {
  beforeEach(() => {
    customMock.mockClear();
  });

  it('globalToast renders ToastContent without status', () => {
    globalToast('세션이 만료되었어요');

    expect(customMock).toHaveBeenCalledTimes(1);
    const [element, options] = customMock.mock.calls[0];
    expect(element.props).toMatchObject({ message: '세션이 만료되었어요', status: undefined });
    expect(options).toEqual({ duration: 2000 });
  });

  it('globalToast renders ToastContent with fail status', () => {
    globalToast('실패했어요', 'fail');

    const [element] = customMock.mock.calls[0];
    expect(element.props).toMatchObject({ message: '실패했어요', status: 'fail' });
  });

  it('globalToast renders ToastContent with success status', () => {
    globalToast('성공했어요', 'success');

    const [element] = customMock.mock.calls[0];
    expect(element.props).toMatchObject({ message: '성공했어요', status: 'success' });
  });
});
