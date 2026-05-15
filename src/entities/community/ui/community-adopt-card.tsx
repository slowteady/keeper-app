import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { memo, useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { styled, Text, TextProps, View, ViewProps, XStack, XStackProps } from 'tamagui';

import { Carousel, Chip } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { buildAdoptTags } from '../lib';
import { CommunityAdoptListDto } from '../schema';
import { CommunityAdoptCardHeader } from './community-adopt-card-header';
import { CommunityAdoptCardStats } from './community-adopt-card-stats';

export interface CommunityAdoptCardProps extends CommunityAdoptListDto {
  onPressCard: (id: number) => void;
  onPressLike: (id: number, isLiked: boolean) => void;
  isLoading?: boolean;
  isLoggedIn?: boolean;
}

const CommunityAdoptCardComponent = ({
  id,
  user,
  onPressCard,
  displayTime,
  isLiked = false,
  title,
  content,
  images,
  counts,
  onPressLike,
  isLoading = false,
  isLoggedIn = false,
  animalType,
  gender,
  neuterYn,
  protectionType,
  vaccinationCheck,
  keywords
}: CommunityAdoptCardProps) => {
  const handlePressCard = useCallback(() => onPressCard(id), [onPressCard, id]);
  const handlePressLike = useCallback(() => {
    // 좋아요 토글 시 햅틱 — 추가는 Medium, 해제는 Light
    impactAsync(isLiked ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressLike(id, isLiked);
  }, [id, isLiked, onPressLike]);

  // 자식 hearTap 이 먼저 인식되면 cardTap 은 fail.
  // requireExternalGestureToFail 로 명시 합성 — 자식 영역에서 cardTap 으로 잘못 떨어지는 케이스 차단.
  const { cardTap, heartTap } = useMemo(() => {
    const heart = Gesture.Tap()
      .maxDuration(250)
      .maxDeltaX(8)
      .maxDeltaY(8)
      .enabled(isLoggedIn && !isLoading)
      .onEnd((_e, success) => {
        if (success) handlePressLike();
      })
      .runOnJS(true);

    const card = Gesture.Tap()
      .maxDuration(250)
      .maxDeltaX(8)
      .maxDeltaY(8)
      .requireExternalGestureToFail(heart)
      .onEnd((_e, success) => {
        if (success) handlePressCard();
      })
      .runOnJS(true);

    return { cardTap: card, heartTap: heart };
  }, [handlePressCard, handlePressLike, isLoggedIn, isLoading]);

  // raw enum 을 라벨로 변환 (관심사 분리 — 백엔드는 enum 만 응답)
  // 입양생활은 사용자 자유 입력 keywords 를 그대로 노출, 그 외는 enum → 라벨 자동 생성
  const tags = useMemo(
    () =>
      keywords && keywords.length > 0
        ? keywords
        : buildAdoptTags({ animalType, gender, neuterYn, protectionType, vaccinationCheck }),
    [animalType, gender, neuterYn, protectionType, vaccinationCheck, keywords]
  );
  const hasTags = tags.length > 0;

  return (
    <GestureDetector gesture={cardTap}>
      <View>
        <XStack items="center" justify="space-between" mb={12}>
          <CommunityAdoptCardHeader
            image={user?.image ?? ''}
            nickname={user?.nickname ?? '탈퇴한 사용자'}
            displayTime={displayTime}
          />

          <GestureDetector gesture={heartTap}>
            <View hitSlop={10}>
              <AnimatedHeart isLiked={isLiked} size={28} />
            </View>
          </GestureDetector>
        </XStack>
        <CommunityAdoptCardTitle title={title} numberOfLines={1} mb={8} />
        <CommunityAdoptCardContent content={content ?? ''} mb={20} />
        {hasTags && <CommunityAdoptCardTags tags={tags} mb={20} />}
        <CommunityAdoptCardCarousel images={images} mb={12} />
        <CommunityAdoptCardStats comment={counts.comment} like={counts.like} view={counts.view} />
      </View>
    </GestureDetector>
  );
};

export const CommunityAdoptCard = memo(CommunityAdoptCardComponent);
CommunityAdoptCard.displayName = 'CommunityAdoptCard';

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
