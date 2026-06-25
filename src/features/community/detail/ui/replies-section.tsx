import { useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { styled, Text, View } from 'tamagui';

import { CommentCard, CommentDto } from '@/entities/comment';
import { pressHaptic } from '@/shared/lib';

import { useReplies } from '../model/use-replies';

export type RepliesSectionProps = {
  parentComment: CommentDto;
  onPressReplyMore?: (reply: CommentDto) => void;
};

export const RepliesSection = ({ parentComment, onPressReplyMore }: RepliesSectionProps) => {
  const [expanded, setExpanded] = useState(false);

  const { replies, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useReplies({
    parentId: parentComment.id,
    enabled: expanded
  });

  if (parentComment.replyCount === 0 && !expanded) return null;

  return (
    <View mt={12} ml={32}>
      <ToggleButton onPress={() => setExpanded((v) => !v)}>
        <ToggleLine />
        <ToggleText>{expanded ? '답글 숨기기' : `답글 ${parentComment.replyCount}개 보기`}</ToggleText>
      </ToggleButton>

      {expanded && (
        <View mt={12}>
          {isLoading && replies.length === 0 ? (
            <View py={12} items="center">
              <ActivityIndicator />
            </View>
          ) : (
            replies.map((reply) => (
              <View key={reply.id} py={12}>
                <CommentCard
                  comment={reply}
                  onPressMore={onPressReplyMore ? () => onPressReplyMore(reply) : undefined}
                />
              </View>
            ))
          )}

          {hasNextPage && (
            <Pressable
              onPress={() => {
                pressHaptic();
                fetchNextPage();
              }}
              disabled={isFetchingNextPage}
            >
              <View py={8}>
                {isFetchingNextPage ? <ActivityIndicator size="small" /> : <ToggleText>답글 더 보기</ToggleText>}
              </View>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const ToggleButton = styled(View, {
  flexDirection: 'row',
  items: 'center',
  gap: 8,
  py: 4
});

const ToggleLine = styled(View, {
  width: 24,
  height: 1,
  bg: '$white700'
});

const ToggleText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  color: '$black500'
});
