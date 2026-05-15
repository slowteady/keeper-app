import { useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { styled, Text, View } from 'tamagui';

import { CommentCard, CommentDto } from '@/entities/comment';

import { useReplies } from '../model/use-replies';

export type RepliesSectionProps = {
  parentComment: CommentDto;
  onPressReplyMore?: (reply: CommentDto) => void;
  onPressReplyHelpful?: (reply: CommentDto) => void;
};

/**
 * 댓글(root) 카드 아래 노출되는 답글 영역
 *  - replyCount === 0 이면 렌더 안 함
 *  - "답글 N개 보기" 토글 — 펼치면 lazy fetch (useReplies)
 *  - reply 카드는 indent 32pt 로 시각 구분 (Facebook/Instagram 1뎁스 패턴)
 *  - 무한스크롤 BP — onEndReached 대신 명시 "답글 더 보기" 버튼 (수가 많을 때만 표시)
 */
export const RepliesSection = ({ parentComment, onPressReplyMore, onPressReplyHelpful }: RepliesSectionProps) => {
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
                  onPressHelpful={onPressReplyHelpful ? () => onPressReplyHelpful(reply) : undefined}
                />
              </View>
            ))
          )}

          {hasNextPage && (
            <Pressable onPress={fetchNextPage} disabled={isFetchingNextPage}>
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
