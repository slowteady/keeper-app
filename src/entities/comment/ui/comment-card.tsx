import { Heart, MoreVertical } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Avatar, styled, Text, XStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { CommentDto } from '../model';

export type CommentCardProps = {
  comment: CommentDto;
  onPressMore?: () => void;
  // root 댓글에서만 노출 — reply 카드(parentId 존재)에는 안 보임 (1뎁스)
  onPressReply?: () => void;
  // 도움돼요 토글 — root/reply 모두 노출
  onPressHelpful?: () => void;
};

export const CommentCard = ({ comment, onPressMore, onPressReply, onPressHelpful }: CommentCardProps) => {
  return (
    <>
      <XStack items="center" justify="space-between" mb={16}>
        <XStack items="center" flex={1}>
          <CommentCardHeader
            image={comment.user?.image ?? ''}
            nickname={comment.user?.nickname ?? '탈퇴한 사용자'}
            displayTime={comment.displayTime}
            isEdited={comment.isEdited}
          />
        </XStack>
        {onPressMore && (
          <Pressable onPress={onPressMore} hitSlop={10} testID={`comment-more-${comment.id}`}>
            <MoreVertical size={18} color="$black700" />
          </Pressable>
        )}
      </XStack>

      <Text fontSize={15} lineHeight={22} fontWeight={500} color="$black650" letterSpacing={-0.25}>
        {comment.content}
      </Text>

      <XStack mt={16} items="center" gap={16}>
        {onPressHelpful && (
          <Pressable onPress={onPressHelpful} hitSlop={6} testID={`comment-helpful-${comment.id}`}>
            <XStack items="center" gap={4}>
              <Heart
                size={14}
                color={comment.isHelpful ? '$primaryMain' : '$black500'}
                fill={comment.isHelpful ? '$primaryMain' : 'transparent'}
              />
              {comment.helpfulCount > 0 && (
                <ActionButtonText color={comment.isHelpful ? '$primaryMain' : '$black500'}>
                  {comment.helpfulCount}
                </ActionButtonText>
              )}
            </XStack>
          </Pressable>
        )}
        {onPressReply && (
          <Pressable onPress={onPressReply} hitSlop={6} testID={`comment-reply-${comment.id}`}>
            <ActionButtonText>답글 달기</ActionButtonText>
          </Pressable>
        )}
      </XStack>
    </>
  );
};

type CommentCardHeaderProps = {
  image: string;
  nickname: string;
  displayTime: string;
  isEdited?: boolean;
};
const CommentCardHeader = ({ image, nickname, displayTime, isEdited }: CommentCardHeaderProps) => {
  return (
    <XStack items="center">
      <StyledAvatar>
        <Avatar.Image source={{ uri: image }} />
        <Avatar.Fallback backgroundColor="$black400" />
      </StyledAvatar>
      <Text fontSize={14} lineHeight={16} fontWeight={600} ml={8} color="$black700">
        {nickname}
      </Text>
      <Text fontSize={12} lineHeight={14} fontWeight={500} ml={4} color="$black500">
        {formatTimeAgo(displayTime)}
        {isEdited ? ' · 수정됨' : ''}
      </Text>
    </XStack>
  );
};

const StyledAvatar = styled(Avatar, {
  size: 24,
  rounded: 4
});

const ActionButtonText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  color: '$black500'
});
