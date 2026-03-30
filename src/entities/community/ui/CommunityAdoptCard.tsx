import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { styled, Text, TextProps, View, ViewProps, XStack, XStackProps } from 'tamagui';

import { useLoginRequired } from '@/features/auth';
import { Carousel, Chip } from '@/shared/ui';
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
  const { isLoggedIn } = useLoginRequired();

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
        <XStack items="center" justify="space-between" mb={12}>
          <CommunityAdoptCardHeader image={user.image} nickname={user.nickname} displayTime={displayTime} />

          <CommunityAdoptCardHeart
            isLiked={isLiked}
            onPress={handlePressLike}
            disabled={!isLoggedIn}
            loading={isLoading}
          />
        </XStack>
        <CommunityAdoptCardTitle title={title} numberOfLines={1} mb={8} />
        <CommunityAdoptCardContent content={content} mb={20} />
        {hasTags && <CommunityAdoptCardTags tags={tags} mb={20} />}
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
  return <AnimatedHeart isLiked={isLiked} onPress={onPress} disabled={disabled} loading={loading} size={28} />;
};

export const CommunityAdoptCardTitle = ({ title, ...props }: { title: string } & TextProps) => {
  return <StyledTitle {...props}>{title}</StyledTitle>;
};

export const CommunityAdoptCardTags = ({ tags, ...props }: { tags: string[] } & XStackProps) => {
  return (
    <XStack gap={6} flexWrap="wrap" {...props}>
      {tags.map((tag, idx) => (
        <Chip key={`${tag}-${idx}`} text={tag} />
      ))}
    </XStack>
  );
};

export const CommunityAdoptCardContent = ({ content, ...props }: { content: string } & Omit<TextProps, 'content'>) => {
  return <StyledContent {...props}>{content}</StyledContent>;
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
  lineHeight: 32,
  fontWeight: 600,
  color: '$black800',
  numberOfLines: 2,
  ellipsizeMode: 'tail',
  letterSpacing: -0.25
});

const StyledContent = styled(Text, {
  fontSize: 15,
  lineHeight: 24,
  fontWeight: 400,
  color: '$black600',
  numberOfLines: 2,
  ellipsizeMode: 'tail'
});

const CarouselWrap = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 5 / 4,
  position: 'relative'
});
