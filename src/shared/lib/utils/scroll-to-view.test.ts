import { scrollToView } from './scroll-to-view';

describe('scrollToView', () => {
  it('scrolls to the native view with top spacing', () => {
    const scrollResponderScrollNativeHandleToKeyboard = jest.fn();
    const scrollView = { scrollResponderScrollNativeHandleToKeyboard };
    const view = {};

    const didScroll = scrollToView({ current: scrollView } as never, { current: view } as never);

    expect(didScroll).toBe(true);
    expect(scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(view, 20, true);
  });

  it('does nothing before refs are mounted', () => {
    expect(scrollToView({ current: null }, { current: null })).toBe(false);
  });
});
