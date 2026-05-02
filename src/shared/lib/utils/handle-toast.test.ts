import { globalToast, setToastRef } from './handle-toast';

describe('handle-toast', () => {
  afterEach(() => {
    setToastRef(() => {});
  });

  it('globalToast does nothing when ref is not set', () => {
    // setToastRef 호출 전이라 에러 없이 무시되어야 함
    expect(() => globalToast('test')).not.toThrow();
  });

  it('globalToast calls registered show function with message', () => {
    const mockShow = jest.fn();
    setToastRef(mockShow);

    globalToast('세션이 만료되었어요.');

    expect(mockShow).toHaveBeenCalledWith('세션이 만료되었어요.', undefined);
  });

  it('globalToast passes status as customData', () => {
    const mockShow = jest.fn();
    setToastRef(mockShow);

    globalToast('실패했어요.', 'fail');

    expect(mockShow).toHaveBeenCalledWith('실패했어요.', { customData: { status: 'fail' } });
  });

  it('globalToast passes success status', () => {
    const mockShow = jest.fn();
    setToastRef(mockShow);

    globalToast('성공했어요.', 'success');

    expect(mockShow).toHaveBeenCalledWith('성공했어요.', { customData: { status: 'success' } });
  });

  it('setToastRef replaces previous ref', () => {
    const firstShow = jest.fn();
    const secondShow = jest.fn();

    setToastRef(firstShow);
    setToastRef(secondShow);

    globalToast('test');

    expect(firstShow).not.toHaveBeenCalled();
    expect(secondShow).toHaveBeenCalledWith('test', undefined);
  });
});
