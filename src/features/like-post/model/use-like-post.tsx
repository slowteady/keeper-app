import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';
import { globalToast, toggleHaptic } from '@/shared/lib';

import { patchLikeCache } from '../lib/patch-like-cache';

type ToggleVars = { postId: string; currentlyLiked: boolean };
type LikeResponse = { count: number; isLiked: boolean };

// 좋아요 mutation key — 카드별 isPending 격리는 variables 의 postId 로 predicate 매칭.
export const LIKE_POST_MUTATION_KEY = ['like-post'] as const;

// community 도메인 캐시 prefix — list/detail 매칭
const COMMUNITY_PREFIX = communityQueries.all();
// 마이페이지 좋아요 목록은 별도 prefix (myLikedList queryKey)
const ME_LIKED_PREFIX = ['me-liked-posts'] as const;

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginRequired();

  const mutation = useMutation<LikeResponse, unknown, ToggleVars, { backup: [readonly unknown[], unknown][] }>({
    mutationKey: [...LIKE_POST_MUTATION_KEY],
    mutationFn: ({ postId, currentlyLiked }) =>
      currentlyLiked ? communityApi.unlikePost(postId) : communityApi.likePost(postId),

    onMutate: async ({ postId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: COMMUNITY_PREFIX });
      await queryClient.cancelQueries({ queryKey: ME_LIKED_PREFIX });
      const backup = [
        ...queryClient.getQueriesData({ queryKey: COMMUNITY_PREFIX }),
        ...queryClient.getQueriesData({ queryKey: ME_LIKED_PREFIX })
      ];

      const nextIsLiked = !currentlyLiked;
      const applyPatch = (queryKey: readonly unknown[]) =>
        queryClient.setQueriesData({ queryKey }, (old: unknown) => {
          const current = readCurrentCount(old, postId);
          if (current === undefined) return old;
          return patchLikeCache(old, postId, {
            isLiked: nextIsLiked,
            count: nextIsLiked ? current + 1 : Math.max(0, current - 1)
          });
        });
      applyPatch(COMMUNITY_PREFIX);
      applyPatch(ME_LIKED_PREFIX);

      return { backup };
    },

    onError: (_err, _vars, context) => {
      if (context?.backup) {
        for (const [key, value] of context.backup) {
          queryClient.setQueryData(key, value);
        }
      }
      globalToast('좋아요를 처리하지 못했어요', 'fail');
    },

    onSuccess: (data, { postId }) => {
      const applySuccess = (queryKey: readonly unknown[]) =>
        queryClient.setQueriesData({ queryKey }, (old: unknown) =>
          patchLikeCache(old, postId, { isLiked: data.isLiked, count: data.count })
        );
      applySuccess(COMMUNITY_PREFIX);
      applySuccess(ME_LIKED_PREFIX);
    },

    // 연속 토글 race condition 방지 — 마지막 mutation 만 invalidate.
    // 관심 목록(ME_LIKED)은 무효화 X — 카드 내 해제가 즉시 사라지지 않고 다음 focus refetch 까지 잔존 (29cm)
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...LIKE_POST_MUTATION_KEY] }) === 1) {
        queryClient.invalidateQueries({ queryKey: COMMUNITY_PREFIX });
      }
    }
  });

  const toggleLikePost = useCallback(
    (postId: string, currentlyLiked: boolean) => {
      toggleHaptic(currentlyLiked);
      requireLogin(() => mutation.mutate({ postId, currentlyLiked }));
    },
    [mutation, requireLogin]
  );

  // 댓글 좋아요는 spec v2 보류
  const toggleLikeComment = useCallback(async (_commentId: number) => {
    // noop
  }, []);

  return { toggleLikePost, toggleLikeComment, isPending: mutation.isPending };
};

// 특정 postId 의 좋아요 mutation 이 진행 중인지 — 카드별 isLoading 노출용.
// useMutation 자체는 단일 인스턴스 지만 variables 의 postId 로 predicate 매칭해 격리.
export const useIsLikePending = (postId: string): boolean => {
  const count = useIsMutating({
    mutationKey: [...LIKE_POST_MUTATION_KEY],
    predicate: (m) => (m.state.variables as ToggleVars | undefined)?.postId === postId
  });
  return count > 0;
};

// 캐시 안에서 해당 id 의 현재 like count 를 찾아 반환. 못 찾으면 undefined.
const readCurrentCount = (data: unknown, postId: string): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.pages)) {
    for (const page of d.pages as { items?: { id: string; counts?: { like: number } }[] }[]) {
      const found = page.items?.find((i) => i.id === postId);
      if (found?.counts) return found.counts.like;
    }
    return undefined;
  }
  // detail 캐시 union — { kind: 'ADOPT', adopt } | { kind: 'QNA', qna }
  if (d.kind === 'ADOPT' || d.kind === 'QNA') {
    const inner = (d.kind === 'QNA' ? d.qna : d.adopt) as { id: string; counts?: { like: number } } | undefined;
    if (inner && inner.id === postId && inner.counts) return inner.counts.like;
    return undefined;
  }
  if ('id' in d && 'counts' in d && (d.id as string) === postId) {
    return (d.counts as { like: number }).like;
  }
  return undefined;
};
