import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { commentApi, commentQueries, type HelpfulToggleResponseDto } from '@/entities/comment';
import { useLoginRequired } from '@/features/auth';
import { globalToast, toggleHaptic } from '@/shared/lib';

import { patchHelpfulCache } from '../lib/patch-helpful-cache';

type ToggleVars = { commentId: string; currentlyHelpful: boolean; currentCount: number };

const COMMENT_PREFIX = commentQueries.all();
// 마이페이지 관심 댓글 list 는 도메인 prefix 와 별도 namespace — optimistic patch 만, invalidate 는 안 함 (29cm 잔존).
const ME_HELPFUL_PREFIX = ['me-helpful-comments'] as const;
const COMMENT_HELPFUL_MUTATION_KEY = ['comment-helpful'] as const;

export const useCommentHelpful = () => {
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginRequired();

  const mutation = useMutation<
    HelpfulToggleResponseDto,
    unknown,
    ToggleVars,
    { backup: [readonly unknown[], unknown][] }
  >({
    mutationKey: [...COMMENT_HELPFUL_MUTATION_KEY],
    mutationFn: ({ commentId, currentlyHelpful }) =>
      currentlyHelpful ? commentApi.unhelpful(commentId) : commentApi.helpful(commentId),

    onMutate: async ({ commentId, currentlyHelpful, currentCount }) => {
      await queryClient.cancelQueries({ queryKey: COMMENT_PREFIX });
      await queryClient.cancelQueries({ queryKey: ME_HELPFUL_PREFIX });
      const backup = [
        ...queryClient.getQueriesData({ queryKey: COMMENT_PREFIX }),
        ...queryClient.getQueriesData({ queryKey: ME_HELPFUL_PREFIX })
      ];

      const nextIsHelpful = !currentlyHelpful;
      const nextCount = nextIsHelpful ? currentCount + 1 : Math.max(0, currentCount - 1);
      const patch = (old: unknown) => patchHelpfulCache(old, commentId, { isHelpful: nextIsHelpful, count: nextCount });
      queryClient.setQueriesData({ queryKey: COMMENT_PREFIX }, patch);
      queryClient.setQueriesData({ queryKey: ME_HELPFUL_PREFIX }, patch);
      return { backup };
    },

    onError: (_err, _vars, context) => {
      if (context?.backup) {
        for (const [key, value] of context.backup) {
          queryClient.setQueryData(key, value);
        }
      }
      globalToast('도움돼요 처리에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    },

    onSuccess: (data, { commentId }) => {
      const patch = (old: unknown) =>
        patchHelpfulCache(old, commentId, { isHelpful: data.isHelpful, count: data.count });
      queryClient.setQueriesData({ queryKey: COMMENT_PREFIX }, patch);
      queryClient.setQueriesData({ queryKey: ME_HELPFUL_PREFIX }, patch);
    },

    // 연속 토글 race condition 방지 — 마지막 mutation 만 invalidate.
    // ME_HELPFUL_PREFIX 는 별도 namespace — invalidate 안 함 (29cm 잔존 패턴, 다른 chip 들과 정합).
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...COMMENT_HELPFUL_MUTATION_KEY] }) === 1) {
        queryClient.invalidateQueries({ queryKey: COMMENT_PREFIX });
      }
    }
  });

  const toggleHelpful = useCallback(
    (vars: ToggleVars) => {
      toggleHaptic(vars.currentlyHelpful);
      requireLogin(() => mutation.mutate(vars));
    },
    [mutation, requireLogin]
  );

  return { toggleHelpful, isPending: mutation.isPending };
};
