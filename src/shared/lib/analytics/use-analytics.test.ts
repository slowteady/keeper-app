import { renderHook } from '@testing-library/react-native';
import { usePostHog } from 'posthog-react-native';

import { ANALYTICS_EVENT } from './events';
import { useAnalytics } from './use-analytics';

jest.mock('posthog-react-native', () => ({ usePostHog: jest.fn() }));

const mockUsePostHog = usePostHog as jest.Mock;

describe('useAnalytics', () => {
  afterEach(() => jest.clearAllMocks());

  it('PostHogProvider 밖(usePostHog=undefined)에서 no-op', () => {
    mockUsePostHog.mockReturnValue(undefined);
    const { result } = renderHook(() => useAnalytics());

    expect(() => result.current.track(ANALYTICS_EVENT.login)).not.toThrow();
    expect(() => result.current.identify('1')).not.toThrow();
    expect(() => result.current.reset()).not.toThrow();
  });

  it('posthog 인스턴스가 있으면 capture/identify로 위임한다', () => {
    const posthog = {
      capture: jest.fn(),
      screen: jest.fn(),
      identify: jest.fn(),
      reset: jest.fn()
    };
    mockUsePostHog.mockReturnValue(posthog);
    const { result } = renderHook(() => useAnalytics());

    result.current.track(ANALYTICS_EVENT.login, { social_type: 'kakao' });
    result.current.identify('42', { nickname: 'keeper' });

    expect(posthog.capture).toHaveBeenCalledWith('login', { social_type: 'kakao' });
    expect(posthog.identify).toHaveBeenCalledWith('42', { nickname: 'keeper' });
  });
});
