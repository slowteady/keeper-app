import { Avatar, styled, Text, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/utils';

export interface CommunityAdoptCardProps {
  user: { image: string; nickname: string };
  onPressUser: () => void;
  displayTime: string;
}

export const CommunityAdoptCard = ({ user, onPressUser, displayTime }: CommunityAdoptCardProps) => {
  const formattedTime = formatTimeAgo(displayTime);

  return (
    <YStack>
      <XStack items="center" justify="space-between">
        <XStack items="center">
          <StyledAvatar onPress={onPressUser}>
            <Avatar.Image source={{ uri: user.image }} />
            <Avatar.Fallback backgroundColor="$black400" />
          </StyledAvatar>
          <Text fontSize={13} fontWeight={500} ml={8}>
            {user.nickname}
          </Text>
          <Text fontSize={13} fontWeight={400} ml={8} color="$black400">
            {formattedTime}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
};

const StyledAvatar = styled(Avatar, {
  width: 30,
  height: 30,
  rounded: 4
});
