import { memo, useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { styled, Text, TextProps, useTheme, View, ViewProps, XStack, XStackProps } from 'tamagui';

import { toggleHaptic } from '@/shared/lib';
import { Carousel, CarouselVideoItem, Chip, NoImage } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { buildAdoptTags } from '../lib';
import { CommunityAdoptListDto } from '../schema';
import { PostCardHeader } from './post-card-header';
import { PostStats } from './post-stats';

export interface PostCardProps extends CommunityAdoptListDto {
  onPressCard: (id: string) => void;
  onPressLike: (id: string, isLiked: boolean) => void;
  isLoading?: boolean;
}

const PostCardComponent = ({
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
  animalType,
  gender,
  neuterYn,
  protectionType,
  vaccinationCheck,
  keywords
}: PostCardProps) => {
  const { black500 } = useTheme();
  const handlePressCard = useCallback(() => onPressCard(id), [onPressCard, id]);
  const handlePressLike = useCallback(() => {
    toggleHaptic(isLiked);
    onPressLike(id, isLiked);
  }, [id, isLiked, onPressLike]);

  // 자식 hearTap 이 먼저 인식되면 cardTap 은 fail.
  // requireExternalGestureToFail 로 명시 합성 — 자식 영역에서 cardTap 으로 잘못 떨어지는 케이스 차단.
  // 비로그인 상태에서도 heart gesture 자체는 활성 — onPressLike 가 requireLogin 으로 모달 표시 책임. (disabled 면 cardTap 이 잡혀 상세 라우팅 버그)
  const { cardTap, heartTap } = useMemo(() => {
    const heart = Gesture.Tap()
      .maxDuration(250)
      .maxDeltaX(8)
      .maxDeltaY(8)
      .enabled(!isLoading)
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
  }, [handlePressCard, handlePressLike, isLoading]);

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
      <View testID={`community-card-${id}`}>
        <XStack items="center" justify="space-between" mb={12}>
          <PostCardHeader
            image={user?.image ?? ''}
            nickname={user?.nickname ?? '탈퇴한 사용자'}
            displayTime={displayTime}
          />

          <GestureDetector gesture={heartTap}>
            <View hitSlop={10} testID={`community-card-heart-${id}`}>
              <AnimatedHeart isLiked={isLiked} size={28} inactiveColor={black500.val} />
            </View>
          </GestureDetector>
        </XStack>
        <PostCardTitle title={title} numberOfLines={1} mb={8} />
        <PostCardContent content={content ?? ''} mb={20} />
        {hasTags && <PostCardTags tags={tags} mb={20} />}
        <PostCardCarousel images={images} mb={12} />
        <PostStats comment={counts.comment} like={counts.like} view={counts.view} />
      </View>
    </GestureDetector>
  );
};

export const PostCard = memo(PostCardComponent);
PostCard.displayName = 'PostCard';

export const PostCardTitle = ({ title, ...props }: { title: string } & TextProps) => {
  return <StyledTitle {...props}>{title}</StyledTitle>;
};

export const PostCardTags = ({ tags, ...props }: { tags: string[] } & XStackProps) => {
  return (
    <XStack gap={6} flexWrap="wrap" {...props}>
      {tags.map((tag, idx) => (
        <Chip key={`${tag}-${idx}`} text={tag} />
      ))}
    </XStack>
  );
};

export const PostCardContent = ({ content, ...props }: { content: string } & Omit<TextProps, 'content'>) => {
  return <StyledContent {...props}>{content}</StyledContent>;
};

type PostCardCarouselProps = {
  images: string[];
  videoItem?: CarouselVideoItem | null;
  showImageViewer?: boolean;
} & ViewProps;

export const PostCardCarousel = ({ images, videoItem, showImageViewer = false, ...props }: PostCardCarouselProps) => {
  const hasMedia = (images && images.length > 0) || !!videoItem;
  return (
    <CarouselWrap {...props}>
      {hasMedia ? (
        <Carousel data={images ?? []} videoItem={videoItem} showIndicator showImageViewer={showImageViewer} />
      ) : (
        <NoImage />
      )}
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
