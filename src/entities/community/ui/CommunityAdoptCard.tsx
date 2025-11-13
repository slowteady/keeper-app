import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Avatar, styled, Text, TextProps, useTheme, View, XStack, XStackProps } from 'tamagui';

import { Carousel, Chip, useLoginRequired } from '@/shared';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Comment, Eye, LikeHeart } from '@/shared/ui/icons/outline';

import { convertNumber } from '../lib';

export interface AdoptCardSchema {
  id: string;
  user: { id: string; image: string; nickname: string };
  title: string;
  content: string;
  displayTime: string;
  isLiked?: boolean;
  tags: string[];
  images: string[];
  counts: { like: number; comment: number; view: number };
}

export interface AdoptCardProps extends AdoptCardSchema {
  onPressCard: (id: string) => void;
  onPressLike: (id: string) => void;
  isLoading?: boolean;
}

export const AdoptCard = ({
  id,
  user,
  onPressCard,
  displayTime,
  isLiked = false,
  title,
  content,
  tags,
  images,
  counts,
  onPressLike,
  isLoading = false
}: AdoptCardProps) => {
  const { black500 } = useTheme();
  const { isLoggedInSync } = useLoginRequired();

  const tap = Gesture.Tap()
    .maxDuration(250) // 탭 최대 지속시간
    .maxDeltaX(8) // X축 이동 허용치(px)
    .maxDeltaY(8) // Y축 이동 허용치(px)
    .onEnd((_e, success) => {
      if (success) handlePressCard();
    })
    .runOnJS(true);

  const handlePressCard = useCallback(() => {
    onPressCard(id);
  }, [onPressCard, id]);

  const handlePressLike = useCallback(() => {
    onPressLike(id);
  }, [id, onPressLike]);

  const hasTags = tags.length > 0;

  return (
    <GestureDetector gesture={tap}>
      <View>
        <XStack items="center" justify="space-between" mb={14}>
          <CommunityAdoptCardHeader image={user.image} nickname={user.nickname} displayTime={displayTime} />

          <CommunityAdoptCardHeart
            isLiked={isLiked}
            onPress={handlePressLike}
            disabled={!isLoggedInSync()}
            loading={isLoading}
          />
        </XStack>
        <CommunityAdoptCardTitle title={title} />
        <CommunityAdoptCardContent content={content} />
        {hasTags && <CommunityAdoptCardTags tags={tags} />}

        <CommunityAdoptCardCarousel images={images} />

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
      </View>
    </GestureDetector>
  );
};

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
      <Text fontSize={14} fontWeight={600} ml={10} color="#707070">
        {nickname}
      </Text>
      <Text fontSize={14} fontWeight={500} ml={4} letterSpacing={-0.25} color="$black400">
        {displayTime}
      </Text>
    </XStack>
  );
};

export interface CommunityAdoptCardHeartProps {
  isLiked: boolean;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}

export const CommunityAdoptCardHeart = ({ isLiked, onPress, disabled, loading }: CommunityAdoptCardHeartProps) => {
  return <AnimatedHeart isLiked={isLiked} onPress={onPress} disabled={disabled} loading={loading} size={22} />;
};

export const CommunityAdoptCardTitle = ({ title, ...props }: { title: string } & TextProps) => {
  return <StyledTitle {...props}>{title}</StyledTitle>;
};

export const CommunityAdoptCardTags = ({ tags, ...props }: { tags: string[] } & XStackProps) => {
  return (
    <XStack gap={6} flexWrap="wrap" mb={16} {...props}>
      {tags.map((tag, idx) => (
        <Chip key={`${tag}-${idx}`} text={tag} />
      ))}
    </XStack>
  );
};

export const CommunityAdoptCardContent = ({ content }: { content: string }) => {
  return <StyledContent>{content}</StyledContent>;
};

export const CommunityAdoptCardCarousel = ({ images }: { images: string[] }) => {
  return (
    <CarouselWrap mb={12}>
      <Carousel data={images} showIndicator />
    </CarouselWrap>
  );
};

const StyledAvatar = styled(Avatar, {
  size: 32,
  rounded: 4
});
const StyledTitle = styled(Text, {
  fontSize: 20,
  lineHeight: 28,
  fontWeight: 600,
  color: '$black800',
  numberOfLines: 1,
  ellipsizeMode: 'tail',
  mb: 12,
  letterSpacing: -0.25
});
const StyledContent = styled(Text, {
  fontSize: 15,
  lineHeight: 21,
  fontWeight: 400,
  color: '#7E7E7E',
  numberOfLines: 2,
  ellipsizeMode: 'tail',
  mb: 24
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
