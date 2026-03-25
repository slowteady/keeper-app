import { act, renderHook } from '@testing-library/react-native';

import { useCommunityCommentList } from './useCommunityCommentList';

describe('useCommunityCommentList', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useCommunityCommentList());

    expect(result.current).toHaveProperty('sortOrder');
    expect(result.current).toHaveProperty('commentList');
    expect(typeof result.current.changeSortOrder).toBe('function');
    expect(result.current.sortOrder).toBe('LATEST');
    expect(Array.isArray(result.current.commentList)).toBe(true);
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useCommunityCommentList());

    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('actions');
  });

  it('changeSortOrder changes sortOrder value', () => {
    const { result } = renderHook(() => useCommunityCommentList());

    act(() => {
      result.current.changeSortOrder('CREATED');
    });

    expect(result.current.sortOrder).toBe('CREATED');
  });
});
