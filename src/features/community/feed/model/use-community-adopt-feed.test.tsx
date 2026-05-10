import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import React from 'react';

import { useCommunityAdoptFeed } from './use-community-adopt-feed';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useCommunityAdoptFeed', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useCommunityAdoptFeed(), { wrapper });

    expect(result.current).toHaveProperty('adoptList');
    expect(typeof result.current.goDetailPage).toBe('function');
    expect(Array.isArray(result.current.adoptList)).toBe(true);
  });
});
