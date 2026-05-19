import { useMutation, useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useCallback } from 'react';

import { commentApi, commentQueries, type HelpfulToggleResponseDto } from '@/entities/comment';
import { useLoginRequired } from '@/features/auth';
import { globalToast } from '@/shared/lib';

import { patchHelpfulCache } from '../lib/patch-helpful-cache';

type ToggleVars = { commentId: number; currentlyHelpful: boolean; currentCount: number };

const COMMENT_PREFIX = commentQueries.all();
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
      const backup = queryClient.getQueriesData({ queryKey: COMMENT_PREFIX });

      const nextIsHelpful = !currentlyHelpful;
      const nextCount = nextIsHelpful ? currentCount + 1 : Math.max(0, currentCount - 1);
      queryClient.setQueriesData({ queryKey: COMMENT_PREFIX }, (old: unknown) =>
        patchHelpfulCache(old, commentId, { isHelpful: nextIsHelpful, count: nextCount })
      );
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
      queryClient.setQueriesData({ queryKey: COMMENT_PREFIX }, (old: unknown) =>
        patchHelpfulCache(old, commentId, { isHelpful: data.isHelpful, count: data.count })
      );
    },

    // 연속 토글 race condition 방지 — 마지막 mutation 만 invalidate.
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...COMMENT_HELPFUL_MUTATION_KEY] }) === 1) {
        queryClient.invalidateQueries({ queryKey: COMMENT_PREFIX });
      }
    }
  });

  const toggleHelpful = useCallback(
    (vars: ToggleVars) => {
      impactAsync(vars.currentlyHelpful ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(
        () => undefined
      );
      requireLogin(() => mutation.mutate(vars));
    },
    [mutation, requireLogin]
  );

  return { toggleHelpful, isPending: mutation.isPending };
};
