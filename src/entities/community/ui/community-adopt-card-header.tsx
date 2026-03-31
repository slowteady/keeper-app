import { Avatar, styled, Text, XStack } from 'tamagui';

export interface CommunityAdoptCardHeaderProps {
  image: string;
  nickname: string;
  displayTime: string;
}

export const CommunityAdoptCardHeader = ({ image, nickname, displayTime }: CommunityAdoptCardHeaderProps) => {
  return (
    <XStack items="center">
      <StyledAvatar>
        <Avatar.Image source={{ uri: image }} />
        <Avatar.Fallback backgroundColor="$black400" />
      </StyledAvatar>
      <Text fontSize={14} fontWeight={600} ml={10} color="$black650">
        {nickname}
      </Text>
      <Text fontSize={14} fontWeight={500} ml={4} letterSpacing={-0.25} color="$black400">
        {displayTime}
      </Text>
    </XStack>
  );
};

const StyledAvatar = styled(Avatar, {
  size: 32,
  rounded: 4
});
