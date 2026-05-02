import { ThumbsUp } from '@tamagui/lucide-icons';
import { styled, Text, XStack } from 'tamagui';

export type CommentLikeButtonProps = {
  likeByMe: boolean;
  onPress?: () => void;
};

export const CommentLikeButton = ({ likeByMe, onPress }: CommentLikeButtonProps) => {
  const iconColor = likeByMe ? '$white900' : '$black500';
  const textColor = likeByMe ? '$white900' : '$black500';

  return (
    <Container isActive={likeByMe} onPress={onPress} animation="quick">
      <ThumbsUp size={14} color={iconColor} />
      <Text fontSize={12} lineHeight={14} fontWeight={600} color={textColor}>
        도움돼요
      </Text>
    </Container>
  );
};

const Container = styled(XStack, {
  gap: 2,
  px: 12,
  py: 10,
  items: 'center',
  rounded: 30,
  borderWidth: 1,
  animation: 'quick',

  variants: {
    isActive: {
      true: {
        bg: '#1C1C1C',
        borderColor: 'transparent'
      },
      false: {
        bg: 'transparent',
        borderColor: '$white600'
      }
    }
  } as const
});
