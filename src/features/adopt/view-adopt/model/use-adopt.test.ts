import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useAdopt } from './use-adopt';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useSuspenseQuery: jest.fn(() => ({ data: undefined }))
}));

describe('useAdopt', () => {
  it('adopt 키를 포함하는 flat 객체를 반환한다', () => {
    const { result } = renderHook(() => useAdopt({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('adopt');
  });

  it('그룹핑 키를 포함하지 않는다', () => {
    const { result } = renderHook(() => useAdopt({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('actions');
  });

  it('id가 달라도 throw 없이 hook이 호출된다', () => {
    expect(() => {
      renderHook(() => useAdopt({ id: 'some-id' }), { wrapper: createWrapper() });
    }).not.toThrow();
  });

  it('data가 undefined일 때 adopt는 undefined이다', () => {
    const { result } = renderHook(() => useAdopt({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current.adopt).toBeUndefined();
  });
});
