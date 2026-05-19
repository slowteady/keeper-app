import { MoreVertical } from '@tamagui/lucide-icons';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Pressable } from 'react-native';
import { styled, Text, XStack } from 'tamagui';

import {
  CommunityAdoptCardCarousel,
  CommunityAdoptCardHeader,
  CommunityAdoptCardTags,
  CommunityAdoptCardTitle
} from '@/entities/community';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

export type CommunityDetailOverviewSectionProps = {
  id: number;
  image: string;
  nickname: string;
  displayTime: string;
  title: string;
  images: string[];
  tags: string[];
  content: string;
  isLiked?: boolean;
  onPressLike: () => void;
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
  onPressMore
}: CommunityDetailOverviewSectionProps) => {
  const handlePressLike = () => {
    impactAsync(isLiked ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressLike();
  };

  return (
    <>
      <HeaderWrapper mb={20}>
        <CommunityAdoptCardHeader image={image} nickname={nickname} displayTime={displayTime} />
        <XStack gap={16} items="center">
          <Pressable onPress={handlePressLike} hitSlop={10} testID="community-detail-heart">
            <AnimatedHeart size={26} isLiked={isLiked} />
          </Pressable>
          {onPressMore && (
            <Pressable onPress={onPressMore} hitSlop={10} accessibilityLabel="더보기" testID="community-detail-more">
              <MoreVertical size={22} color="$black700" />
            </Pressable>
          )}
        </XStack>
      </HeaderWrapper>

      <CommunityAdoptCardTitle title={title} mb={20} />
      <CommunityAdoptCardCarousel images={images} showImageViewer mb={16} />
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
