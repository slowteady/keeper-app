import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { CommunityAdoptListDto } from '../schema';

export type CommunityPostListItemProps = {
  data: CommunityAdoptListDto;
  categoryLabel: string;
  onPress: (id: number) => void;
  onPressLike?: (id: number, currentlyLiked: boolean) => void;
};

export const CommunityPostListItem = ({ data, categoryLabel, onPress, onPressLike }: CommunityPostListItemProps) => {
  const { black500 } = useTheme();
  const thumbnail = data.images?.[0];
  const previewText = data.content?.trim() || data.title;

  const handlePressLike = useCallback(() => {
    if (!onPressLike) return;
    impactAsync(data.isLiked ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressLike(data.id, data.isLiked);
  }, [data.id, data.isLiked, onPressLike]);

  return (
    <Container>
      <Pressable onPress={() => onPress(data.id)} style={{ flex: 1 }}>
        <YStack gap={8}>
          <XStack items="center" gap={8}>
            <CategoryChip>
              <CategoryText>{categoryLabel}</CategoryText>
            </CategoryChip>
            <DisplayTime>{data.displayTime}</DisplayTime>
          </XStack>
          <Preview numberOfLines={2}>{previewText}</Preview>
          <Meta>{data.counts.like}명이 공감했어요</Meta>
        </YStack>
      </Pressable>
      <View>
        {thumbnail ? <Thumbnail source={{ uri: thumbnail }} contentFit="cover" /> : <ThumbnailPlaceholder />}
        <HeartWrap>
          <Pressable onPress={handlePressLike} hitSlop={8} disabled={!onPressLike}>
            <AnimatedHeart isLiked={data.isLiked} size={20} inactiveColor={black500.val} />
          </Pressable>
        </HeartWrap>
      </View>
    </Container>
  );
};

const Container = styled(XStack, {
  py: 16,
  gap: 16,
  borderBottomWidth: 1,
  borderBottomColor: '$white850',
  items: 'flex-start'
});

const CategoryChip = styled(View, {
  px: 6,
  py: 5,
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

const Preview = styled(Text, {
  fontSize: 15,
  fontWeight: '600',
  lineHeight: 22,
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

const HeartWrap = styled(View, {
  position: 'absolute',
  t: 4,
  r: 4
});
