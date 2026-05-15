import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { commentApi, commentQueries, type HelpfulToggleResponseDto } from '@/entities/comment';
import { useLoginRequired } from '@/features/auth';
import { globalToast } from '@/shared/lib';

import { patchHelpfulCache } from '../lib/patch-helpful-cache';

type ToggleVars = { commentId: number; currentlyHelpful: boolean; currentCount: number };

const COMMENT_PREFIX = commentQueries.all();

export const useCommentHelpful = () => {
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginRequired();

  const mutation = useMutation<
    HelpfulToggleResponseDto,
    unknown,
    ToggleVars,
    { backup: [readonly unknown[], unknown][] }
  >({
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
    }
  });

  const toggleHelpful = useCallback(
    (vars: ToggleVars) => {
      requireLogin(() => mutation.mutate(vars));
    },
    [mutation, requireLogin]
  );

  return { toggleHelpful, isPending: mutation.isPending };
};
