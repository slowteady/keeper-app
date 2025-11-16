import { styled, Text, useTheme, XStack } from 'tamagui';

import { Comment, Eye, LikeHeart } from '@/shared/ui/icons/outline';

import { convertCountOver999 } from '../lib';

export interface CommunityAdoptCardStatsProps {
  comment: number;
  like: number;
  view: number;
}

export const CommunityAdoptCardStats = ({ comment, like, view }: CommunityAdoptCardStatsProps) => {
  const { black500 } = useTheme();

  return (
    <XStack gap={4}>
      <XStack items="center" gap={2}>
        <Comment width={12} height={12} color={black500.val} />
        <StyledText>{convertCountOver999(comment)}</StyledText>
      </XStack>
      <XStack items="center" gap={2}>
        <LikeHeart width={12} height={12} color={black500.val} />
        <StyledText>{convertCountOver999(like)}</StyledText>
      </XStack>
      <XStack items="center" gap={2}>
        <Eye width={12} height={12} color={black500.val} />
        <StyledText>{convertCountOver999(view)}</StyledText>
      </XStack>
    </XStack>
  );
};

const StyledText = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: 400,
  color: '$black500'
});
