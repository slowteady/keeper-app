import { Avatar, styled, Text, XStack, YStack } from 'tamagui';

import { Chip } from '@/shared/components/_atoms';
import { AnimatedHeart } from '@/shared/components/_atoms/icons/animated';

export interface CommunityAdoptCardData {
  user: { image: string; nickname: string };
  title: string;
  content: string;
  displayTime: string;
  isLiked?: boolean;
  tags: string[];
}
export interface CommunityAdoptCardProps extends CommunityAdoptCardData {
  onPressUser: () => void;
}

// TODO
// [ ] 캐러셀
export const CommunityAdoptCard = ({
  user,
  onPressUser,
  displayTime,
  isLiked = false,
  title,
  content,
  tags
}: CommunityAdoptCardProps) => {
  const hasTags = tags.length > 0;

  return (
    <YStack>
      <XStack items="center" justify="space-between" mb={20}>
        <XStack items="center">
          <StyledAvatar onPress={onPressUser}>
            <Avatar.Image source={{ uri: user.image }} />
            <Avatar.Fallback backgroundColor="$black400" />
          </StyledAvatar>
          <Text fontSize={13} fontWeight={500} ml={8}>
            {user.nickname}
          </Text>
          <Text fontSize={13} fontWeight={400} ml={8} color="$black400">
            {displayTime}
          </Text>
        </XStack>

        <AnimatedHeart isLiked={isLiked} />
      </XStack>

      <StyledTitle mb={16}>{title}</StyledTitle>
      <StyledContent mb={20}>{content}</StyledContent>
      {hasTags && (
        <XStack gap={4} flexWrap="wrap" mb={16}>
          {tags.map((tag, idx) => (
            <Chip key={`${tag}-${idx}`} text={tag} />
          ))}
        </XStack>
      )}
    </YStack>
  );
};

const StyledAvatar = styled(Avatar, {
  width: 30,
  height: 30,
  rounded: 4
});
const StyledTitle = styled(Text, {
  fontSize: 22,
  lineHeight: 26,
  fontWeight: 600,
  color: '$black800',
  numberOfLines: 1,
  ellipsizeMode: 'tail'
});
const StyledContent = styled(Text, {
  fontSize: 15,
  lineHeight: 21,
  fontWeight: 400,
  color: '$black800',
  numberOfLines: 2,
  ellipsizeMode: 'tail'
});
