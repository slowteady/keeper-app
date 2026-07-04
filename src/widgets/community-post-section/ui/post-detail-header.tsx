import { MoreVertical } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { PostCardCarousel, PostCardHeader, PostCardTags, PostCardTitle } from '@/entities/community';
import { formatTimeAgo, pressHaptic, toggleHaptic } from '@/shared/lib';
import { CarouselVideoItem } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';

export type PostDetailHeaderProps = {
  id: string;
  image: string;
  nickname: string;
  displayTime: string;
  title: string;
  images: string[];
  videoItem?: CarouselVideoItem | null;
  categoryTag?: string;
  tags: string[];
  content: string;
  isLiked?: boolean;
  onPressLike: () => void;
  onPressShare?: () => void;
  onPressMore?: () => void;
};

export const PostDetailHeader = ({
  image,
  nickname,
  displayTime,
  title,
  images,
  videoItem,
  categoryTag,
  tags,
  content,
  isLiked = false,
  onPressLike,
  onPressShare,
  onPressMore
}: PostDetailHeaderProps) => {
  const { black600 } = useTheme();
  const handlePressLike = () => {
    toggleHaptic(isLiked);
    onPressLike();
  };
  const handlePressShare = () => {
    pressHaptic();
    onPressShare?.();
  };
  const handlePressMore = () => {
    pressHaptic();
    onPressMore?.();
  };

  return (
    <>
      <HeaderWrapper mb={16}>
        <PostCardHeader image={image} nickname={nickname} />
        <XStack gap={16} items="center" style={{ flexShrink: 0 }}>
          <Pressable onPress={handlePressLike} hitSlop={10} testID="community-detail-heart">
            <AnimatedHeart size={24} isLiked={isLiked} inactiveColor={black600.val} />
          </Pressable>
          {onPressShare && (
            <Pressable
              onPress={handlePressShare}
              hitSlop={10}
              accessibilityLabel="공유하기"
              testID="community-detail-share"
            >
              <ShareIcon width={22} height={22} color={black600.val} />
            </Pressable>
          )}
          {onPressMore && (
            <Pressable
              onPress={handlePressMore}
              hitSlop={10}
              accessibilityLabel="더보기"
              testID="community-detail-more"
            >
              <MoreVertical size={20} color={black600.val as never} />
            </Pressable>
          )}
        </XStack>
      </HeaderWrapper>

      <ChipRow mb={12}>
        {categoryTag ? (
          <CategoryChip>
            <CategoryChipText>{categoryTag}</CategoryChipText>
          </CategoryChip>
        ) : (
          <View flex={1} />
        )}
        {!!displayTime && <DateText>{formatTimeAgo(displayTime)}</DateText>}
      </ChipRow>

      <PostCardTitle title={title} mb={20} />
      {(images.length > 0 || videoItem) && (
        <PostCardCarousel images={images} videoItem={videoItem} showImageViewer mb={16} />
      )}
      {tags.length > 0 && <PostCardTags tags={tags} mb={20} />}
      <Content>{content}</Content>
    </>
  );
};

const HeaderWrapper = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

const ChipRow = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  gap: 12
});

const CategoryChip = styled(View, {
  px: 10,
  py: 5,
  rounded: 999,
  bg: '$backgroundDefault',
  self: 'baseline'
});

const CategoryChipText = styled(Text, {
  fontWeight: 600,
  fontSize: 13,
  lineHeight: 15,
  color: '$black700'
});

const DateText = styled(Text, {
  fontWeight: 500,
  fontSize: 13,
  lineHeight: 16,
  color: '$black400'
});

const Content = styled(Text, {
  fontSize: 15,
  lineHeight: 25,
  fontWeight: 400,
  color: '$black800',
  letterSpacing: -0.25
});
