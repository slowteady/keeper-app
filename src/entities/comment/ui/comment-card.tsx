import { Avatar, styled, Text, XStack } from 'tamagui';

import { CommentDto } from '../model';

export type CommentCardProps = {
  comment: CommentDto;
};

export const CommentCard = ({ comment }: CommentCardProps) => {
  return (
    <>
      <XStack items="center" mb={16}>
        <CommentCardHeader
          image={comment.user?.image ?? ''}
          nickname={comment.user?.nickname ?? '탈퇴한 사용자'}
          displayTime={comment.displayTime}
        />
      </XStack>

      <Text fontSize={15} lineHeight={22} fontWeight={500} color="$black650" letterSpacing={-0.25} mb={20}>
        {comment.content}
      </Text>
    </>
  );
};

type CommentCardHeaderProps = {
  image: string;
  nickname: string;
  displayTime: string;
};
const CommentCardHeader = ({ image, nickname, displayTime }: CommentCardHeaderProps) => {
  return (
    <>
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
    </>
  );
};

const StyledAvatar = styled(Avatar, {
  size: 24,
  rounded: 4
});
