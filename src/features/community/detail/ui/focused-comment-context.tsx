import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { CommentCard, commentQueries } from '@/entities/comment';

import { useCommentMenu } from '../model/use-comment-menu';

type FocusedCommentContextProps = {
  postId: string;
  commentId: string;
  autoEdit: boolean;
  onEdit: (target: { commentId: string; content: string }) => void;
  onShowAll: () => void;
};

export const FocusedCommentContext = ({
  postId,
  commentId,
  autoEdit,
  onEdit,
  onShowAll
}: FocusedCommentContextProps) => {
  const { data } = useQuery(commentQueries.context(postId, commentId));
  const { openCommentMenu } = useCommentMenu({ onEdit, onDeleteSuccess: onShowAll });
  const autoEditTriggered = useRef(false);

  useEffect(() => {
    if (!autoEdit || !data || autoEditTriggered.current) return;
    autoEditTriggered.current = true;
    onEdit({ commentId: data.targetComment.id, content: data.targetComment.content });
  }, [autoEdit, data, onEdit]);

  if (!data) return null;

  const openMenu = (comment: typeof data.targetComment) =>
    openCommentMenu({
      commentId: comment.id,
      authorId: comment.user?.id,
      content: comment.content
    });
  const isReply = data.rootComment.id !== data.targetComment.id;

  return (
    <YStack px={20} py={24} gap={20}>
      <FocusedCard>
        <CommentCard comment={data.rootComment} onPressMore={() => openMenu(data.rootComment)} />
      </FocusedCard>
      {isReply ? (
        <ReplyCard>
          <CommentCard comment={data.targetComment} onPressMore={() => openMenu(data.targetComment)} />
        </ReplyCard>
      ) : null}
      <Pressable onPress={onShowAll}>
        <ShowAllText>전체 댓글 보기</ShowAllText>
      </Pressable>
    </YStack>
  );
};

const FocusedCard = styled(View, {
  p: 16,
  rounded: 12,
  bg: '$white850',
  borderWidth: 1,
  borderColor: '$primaryMain'
});

const ReplyCard = styled(FocusedCard, {
  ml: 32
});

const ShowAllText = styled(Text, {
  self: 'center',
  fontSize: 14,
  fontWeight: '600',
  color: '$black600'
});
