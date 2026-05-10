import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';

import { useCommunityCommentList } from './use-community-comment-list';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useCommunityCommentList', () => {
  it('returns initial sortOrder LATEST and commentList[]', () => {
    const { result } = renderHook(() => useCommunityCommentList(1), { wrapper });
    expect(result.current.sortOrder).toBe('LATEST');
    expect(Array.isArray(result.current.commentList)).toBe(true);
    expect(typeof result.current.changeSortOrder).toBe('function');
  });

  it('changeSortOrder switches between LATEST and OLDEST', () => {
    const { result } = renderHook(() => useCommunityCommentList(1), { wrapper });
    act(() => {
      result.current.changeSortOrder('OLDEST');
    });
    expect(result.current.sortOrder).toBe('OLDEST');
  });
});
