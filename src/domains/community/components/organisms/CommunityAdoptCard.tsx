import { useCallback } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { Avatar, styled, Text, useTheme, View, XStack } from 'tamagui';

import { Chip } from '@/shared/components/_atoms';
import { AnimatedHeart } from '@/shared/components/_atoms/icons/animated';
import { Comment, Eye, LikeHeart } from '@/shared/components/_atoms/icons/outline';
import { Carousel } from '@/shared/components/_molecules';

export interface CommunityAdoptCardData {
  id: string;
  user: { image: string; nickname: string };
  title: string;
  content: string;
  displayTime: string;
  isLiked?: boolean;
  tags: string[];
  images: string[];
  counts: { like: number; comment: number; view: number };
}
export interface CommunityAdoptCardProps extends CommunityAdoptCardData {
  onPressUser: (user: { image: string; nickname: string }) => void;
  onPressCard: (id: string) => void;
}

export const CommunityAdoptCard = ({
  id,
  user,
  onPressUser,
  onPressCard,
  displayTime,
  isLiked = false,
  title,
  content,
  tags,
  images,
  counts
}: CommunityAdoptCardProps) => {
  const { black500 } = useTheme();

  const handlePressUser = useCallback(() => {
    onPressUser(user);
  }, [onPressUser, user]);
  const handlePressCard = useCallback(() => {
    onPressCard(id);
  }, [onPressCard, id]);

  const hasTags = tags.length > 0;

  return (
    <Pressable style={{ paddingVertical: 24 }} onPress={handlePressCard}>
      <XStack items="center" justify="space-between" mb={20}>
        <XStack items="center">
          <StyledAvatar onPress={handlePressUser}>
            <Avatar.Image source={{ uri: user.image }} />
            <Avatar.Fallback backgroundColor="$black400" />
          </StyledAvatar>
          <Text fontSize={13} fontWeight={500} ml={8} onPress={handlePressUser}>
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

      <CarouselWrap mb={12}>
        <Carousel data={images} showIndicator />
      </CarouselWrap>

      <XStack gap={4}>
        <XStack items="center" gap={2}>
          <Comment width={12} height={12} color={black500.val} />
          <StyledText>{convertNumber(counts.comment)}</StyledText>
        </XStack>
        <XStack items="center" gap={2}>
          <LikeHeart width={12} height={12} color={black500.val} strokeWidth={1.5} />
          <StyledText>{convertNumber(counts.like)}</StyledText>
        </XStack>
        <XStack items="center" gap={2}>
          <Eye width={12} height={12} color={black500.val} />
          <StyledText>{convertNumber(counts.view)}</StyledText>
        </XStack>
      </XStack>
    </Pressable>
  );
};

const convertNumber = (number: number) => {
  if (number > 999) {
    return '999+';
  }

  return number;
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
const CarouselWrap = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 5 / 4,
  position: 'relative'
});
const StyledText = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: 400,
  color: '$black500'
});
