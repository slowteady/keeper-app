import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';
import { globalToast } from '@/shared/lib';

import { patchLikeCache } from '../lib/patch-like-cache';

type ToggleVars = { postId: number; currentlyLiked: boolean };
type LikeResponse = { count: number; isLiked: boolean };

// 좋아요 mutation key — 카드별 isPending 격리는 variables 의 postId 로 predicate 매칭.
export const LIKE_POST_MUTATION_KEY = ['like-post'] as const;

// community 도메인 캐시 prefix — list/detail/(향후) my-likes 등 모두 매칭
const COMMUNITY_PREFIX = communityQueries.all();

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginRequired();

  const mutation = useMutation<LikeResponse, unknown, ToggleVars, { backup: [readonly unknown[], unknown][] }>({
    mutationKey: [...LIKE_POST_MUTATION_KEY],
    mutationFn: ({ postId, currentlyLiked }) =>
      currentlyLiked ? communityApi.unlikePost(postId) : communityApi.likePost(postId),

    onMutate: async ({ postId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: COMMUNITY_PREFIX });
      const backup = queryClient.getQueriesData({ queryKey: COMMUNITY_PREFIX });

      const nextIsLiked = !currentlyLiked;
      queryClient.setQueriesData({ queryKey: COMMUNITY_PREFIX }, (old: unknown) => {
        const current = readCurrentCount(old, postId);
        if (current === undefined) return old;
        return patchLikeCache(old, postId, {
          isLiked: nextIsLiked,
          count: nextIsLiked ? current + 1 : Math.max(0, current - 1)
        });
      });

      return { backup };
    },

    onError: (_err, _vars, context) => {
      if (context?.backup) {
        for (const [key, value] of context.backup) {
          queryClient.setQueryData(key, value);
        }
      }
      globalToast('좋아요 처리에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    },

    onSuccess: (data, { postId }) => {
      queryClient.setQueriesData({ queryKey: COMMUNITY_PREFIX }, (old: unknown) =>
        patchLikeCache(old, postId, { isLiked: data.isLiked, count: data.count })
      );
    }
  });

  const toggleLikePost = useCallback(
    (postId: number, currentlyLiked: boolean) => {
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
export const useIsLikePending = (postId: number): boolean => {
  const count = useIsMutating({
    mutationKey: [...LIKE_POST_MUTATION_KEY],
    predicate: (m) => (m.state.variables as ToggleVars | undefined)?.postId === postId
  });
  return count > 0;
};

// 캐시 안에서 해당 id 의 현재 like count 를 찾아 반환. 못 찾으면 undefined.
const readCurrentCount = (data: unknown, postId: number): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.pages)) {
    for (const page of d.pages as { items?: { id: number; counts?: { like: number } }[] }[]) {
      const found = page.items?.find((i) => i.id === postId);
      if (found?.counts) return found.counts.like;
    }
    return undefined;
  }
  if ('id' in d && 'counts' in d && (d.id as number) === postId) {
    return (d.counts as { like: number }).like;
  }
  return undefined;
};
