import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { styled, Text, TextProps, View, ViewProps, XStack, XStackProps } from 'tamagui';

import { Carousel, Chip, useLoginRequired } from '@/shared';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { CommunityAdoptListDto } from '../model';
import { CommunityAdoptCardHeader } from './CommunityAdoptCardHeader';
import { CommunityAdoptCardStats } from './CommunityAdoptCardStats';

export interface CommunityAdoptCardProps extends CommunityAdoptListDto {
  onPressCard: (id: string) => void;
  onPressLike: (id: string) => void;
  isLoading?: boolean;
}

export const CommunityAdoptCard = ({
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
}: CommunityAdoptCardProps) => {
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
        <CommunityAdoptCardCarousel images={images} mb={12} />
        <CommunityAdoptCardStats comment={counts.comment} like={counts.like} view={counts.view} />
      </View>
    </GestureDetector>
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

export const CommunityAdoptCardCarousel = ({ images, ...props }: { images: string[] } & ViewProps) => {
  return (
    <CarouselWrap {...props}>
      <Carousel data={images} showIndicator />
    </CarouselWrap>
  );
};

const StyledTitle = styled(Text, {
  fontSize: 20,
  lineHeight: 30,
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
