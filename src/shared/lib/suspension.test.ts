import { act, renderHook } from '@testing-library/react-native';
import { AxiosError, AxiosResponse } from 'axios';

import { clearSuspended, getSuspensionDetail, isSuspendedError, setSuspended, useSuspension } from './suspension';

const suspendedError = (details: unknown) =>
  new AxiosError('Forbidden', '403', undefined, undefined, {
    status: 403,
    data: { code: 'FAIL', error: 'USER_SUSPENDED', details }
  } as AxiosResponse);

describe('suspension', () => {
  afterEach(() => clearSuspended());

  describe('isSuspendedError', () => {
    it('403 + USER_SUSPENDED면 true', () => {
      expect(isSuspendedError(suspendedError({ reason: null, suspendedUntil: null }))).toBe(true);
    });

    it('403이어도 다른 에러코드면 false', () => {
      const err = new AxiosError('Forbidden', '403', undefined, undefined, {
        status: 403,
        data: { error: 'FORBIDDEN' }
      } as AxiosResponse);
      expect(isSuspendedError(err)).toBe(false);
    });

    it('401이면 false', () => {
      const err = new AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
        data: { error: 'USER_SUSPENDED' }
      } as AxiosResponse);
      expect(isSuspendedError(err)).toBe(false);
    });

    it('AxiosError가 아니면 false', () => {
      expect(isSuspendedError(new Error('boom'))).toBe(false);
    });
  });

  describe('getSuspensionDetail', () => {
    it('details의 reason/suspendedUntil을 추출', () => {
      const err = suspendedError({ reason: '욕설', suspendedUntil: '2026-07-01T00:00:00.000Z' });
      expect(getSuspensionDetail(err)).toEqual({ reason: '욕설', suspendedUntil: '2026-07-01T00:00:00.000Z' });
    });

    it('details 없으면 null로 폴백', () => {
      expect(getSuspensionDetail(new Error('boom'))).toEqual({ reason: null, suspendedUntil: null });
    });
  });

  describe('store', () => {
    it('useSuspension이 set/clear를 구독해 반영', () => {
      const { result } = renderHook(() => useSuspension());
      expect(result.current).toBeNull();

      act(() => setSuspended({ reason: '스팸', suspendedUntil: null }));
      expect(result.current).toEqual({ reason: '스팸', suspendedUntil: null });

      act(() => clearSuspended());
      expect(result.current).toBeNull();
    });
  });
});
