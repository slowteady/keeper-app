import { MoreVertical } from '@tamagui/lucide-icons';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import {
  CommunityAdoptCardCarousel,
  CommunityAdoptCardHeader,
  CommunityAdoptCardTags,
  CommunityAdoptCardTitle
} from '@/entities/community';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';

export type CommunityDetailOverviewSectionProps = {
  id: string;
  image: string;
  nickname: string;
  displayTime: string;
  title: string;
  images: string[];
  tags: string[];
  content: string;
  isLiked?: boolean;
  onPressLike: () => void;
  onPressShare?: () => void;
  onPressMore?: () => void;
};

export const CommunityDetailOverviewSection = ({
  image,
  nickname,
  displayTime,
  title,
  images,
  tags,
  content,
  isLiked = false,
  onPressLike,
  onPressShare,
  onPressMore
}: CommunityDetailOverviewSectionProps) => {
  const { black500 } = useTheme();
  const handlePressLike = () => {
    impactAsync(isLiked ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressLike();
  };

  return (
    <>
      <HeaderWrapper mb={20}>
        <CommunityAdoptCardHeader image={image} nickname={nickname} displayTime={displayTime} />
        <XStack gap={16} items="center" style={{ flexShrink: 0 }}>
          <Pressable onPress={handlePressLike} hitSlop={10} testID="community-detail-heart">
            <AnimatedHeart size={26} isLiked={isLiked} inactiveColor={black500.val} />
          </Pressable>
          {onPressShare && (
            <Pressable
              onPress={onPressShare}
              hitSlop={10}
              accessibilityLabel="공유하기"
              testID="community-detail-share"
            >
              <ShareIcon width={24} height={24} color={black500.val} />
            </Pressable>
          )}
          {onPressMore && (
            <Pressable onPress={onPressMore} hitSlop={10} accessibilityLabel="더보기" testID="community-detail-more">
              <MoreVertical size={22} color="$black500" />
            </Pressable>
          )}
        </XStack>
      </HeaderWrapper>

      <CommunityAdoptCardTitle title={title} mb={20} />
      {images.length > 0 && <CommunityAdoptCardCarousel images={images} showImageViewer mb={16} />}
      <CommunityAdoptCardTags tags={tags} mb={24} />
      <Content>{content}</Content>
    </>
  );
};

const HeaderWrapper = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

const Content = styled(Text, {
  fontSize: 15,
  lineHeight: 25,
  fontWeight: 400,
  color: '$black800',
  letterSpacing: -0.25
});
