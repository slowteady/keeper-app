import { styled, Text, useTheme, XStack } from 'tamagui';

import { Comment, Eye, LikeHeart } from '@/shared/ui/icons/outline';

import { convertCountOver999 } from '../lib';

export type PostStatsProps = {
  comment: number;
  like: number;
  view: number;
};

export const PostStats = ({ comment, like, view }: PostStatsProps) => {
  const { black500 } = useTheme();

  return (
    <XStack gap={6}>
      <IconWrapper>
        <Comment width={12} height={12} color={black500.val} />
        <StyledText>{convertCountOver999(comment)}</StyledText>
      </IconWrapper>

      <IconWrapper>
        <LikeHeart width={12} height={12} color={black500.val} />
        <StyledText>{convertCountOver999(like)}</StyledText>
      </IconWrapper>

      <IconWrapper>
        <Eye width={14} height={14} color={black500.val} />
        <StyledText>{convertCountOver999(view)}</StyledText>
      </IconWrapper>
    </XStack>
  );
};

const IconWrapper = styled(XStack, {
  items: 'center',
  gap: 3
});

const StyledText = styled(Text, {
  fontSize: 13,
  lineHeight: 15,
  fontWeight: 400,
  color: '$black500'
});
