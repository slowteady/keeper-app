import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { MyHelpfulCommentItemDto } from '../schema';

const CATEGORY_LABEL: Record<MyHelpfulCommentItemDto['postCategory'], string> = {
  ADOPTION_PERSONAL: '개인입양',
  ADOPTION_LIFE: '입양생활',
  QNA: '궁금해요'
};

export type CommentListItemProps = {
  data: MyHelpfulCommentItemDto;
  onPress: (postId: string, commentId: string) => void;
  onPressHelpful?: (data: MyHelpfulCommentItemDto) => void;
};

export const CommentListItem = ({ data, onPress, onPressHelpful }: CommentListItemProps) => {
  const { black500 } = useTheme();

  return (
    <Container>
      <Pressable onPress={() => onPress(data.postId, data.id)} style={{ flex: 1 }}>
        <YStack gap={8}>
          <XStack items="center" gap={8}>
            <CategoryChip>
              <CategoryText>{CATEGORY_LABEL[data.postCategory]}</CategoryText>
            </CategoryChip>
            <DisplayTime>{formatTimeAgo(data.displayTime)}</DisplayTime>
          </XStack>
          <Content numberOfLines={2} ellipsizeMode="tail">
            {data.content}
          </Content>
          <XStack items="center" gap={10}>
            {onPressHelpful && (
              <Pressable
                onPress={() => onPressHelpful(data)}
                hitSlop={8}
                testID={`me-helpful-comment-toggle-${data.id}`}
              >
                <AnimatedHeart isLiked={data.isHelpful} size={18} inactiveColor={black500.val} />
              </Pressable>
            )}
            <Meta numberOfLines={1} ellipsizeMode="tail">
              {data.helpfulCount}명이 공감했어요
            </Meta>
          </XStack>
        </YStack>
      </Pressable>
      {data.postThumbnail ? (
        <Thumbnail source={{ uri: data.postThumbnail }} contentFit="cover" />
      ) : (
        <ThumbnailPlaceholder />
      )}
    </Container>
  );
};

const Container = styled(XStack, {
  py: 16,
  gap: 16,
  borderBottomWidth: 1,
  borderBottomColor: '$white850',
  items: 'center'
});

const CategoryChip = styled(View, {
  py: 5,
  px: 6,
  rounded: 4,
  bg: '$white850'
});

const CategoryText = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black700',
  letterSpacing: -0.24
});

const DisplayTime = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500'
});

const Content = styled(Text, {
  fontSize: 15,
  lineHeight: 22,
  fontWeight: '600',
  color: '$black900',
  letterSpacing: -0.45
});

const Meta = styled(Text, {
  fontSize: 11,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.22
});

const Thumbnail = styled(Image, {
  width: 64,
  height: 64,
  rounded: 8
});

const ThumbnailPlaceholder = styled(View, {
  width: 64,
  height: 64,
  rounded: 8,
  bg: '$white850'
});
