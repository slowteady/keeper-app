import { Avatar, styled, Text, XStack, YStack } from 'tamagui';

import { CommentDto } from '../model';
import { CommentLikeButton } from './CommentLikeButton';

export interface CommentCardProps {
  comment: CommentDto;
  onPressLike: () => void;
}

export const CommentCard = ({ comment, onPressLike }: CommentCardProps) => {
  return (
    <Container>
      <CommentCardHeader image={comment.user.image} nickname={comment.user.nickname} displayTime={comment.createdAt} />
      <Text fontSize={14} lineHeight={22} fontWeight={500} color="$black800" letterSpacing={-0.25}>
        {comment.content}
      </Text>
      <CommentCardFooter likeCount={comment.likeCount} likeByMe={comment.likeByMe} onPressLike={onPressLike} />
    </Container>
  );
};

export interface CommentCardHeaderProps {
  image: string;
  nickname: string;
  displayTime: string;
}
export const CommentCardHeader = ({ image, nickname, displayTime }: CommentCardHeaderProps) => {
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
        {displayTime}
      </Text>
    </XStack>
  );
};

export interface CommentCardFooterProps {
  likeCount: number;
  likeByMe: boolean;
  onPressLike: () => void;
}
export const CommentCardFooter = ({ likeCount, likeByMe, onPressLike }: CommentCardFooterProps) => {
  return (
    <XStack items="center" justify="space-between">
      <CommentLikeButton likeByMe={likeByMe} onPress={onPressLike} />
      <Text fontSize={11} lineHeight={13} fontWeight={400} color="$black500">
        {likeCount}명에게 도움이 되었어요
      </Text>
    </XStack>
  );
};

const Container = styled(YStack, {
  gap: 12
});

const StyledAvatar = styled(Avatar, {
  size: 24,
  rounded: 4
});
