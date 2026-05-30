import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { CommunityQnaListItemDto } from '../schema';
import { CommunityAdoptCardStats } from './community-adopt-card-stats';

export type CommunityQnaCardProps = {
  data: CommunityQnaListItemDto;
  categoryLabel: string;
  onPress: (id: number) => void;
  onPressLike?: (id: number, isLiked: boolean) => void;
};

export const CommunityQnaCard = ({ data, categoryLabel, onPress, onPressLike }: CommunityQnaCardProps) => {
  const { black500 } = useTheme();
  const thumbnail = data.images?.[0];

  const handlePressLike = useCallback(() => {
    if (!onPressLike) return;
    impactAsync(data.isLiked ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressLike(data.id, data.isLiked);
  }, [data.id, data.isLiked, onPressLike]);

  return (
    <Container>
      <Pressable onPress={() => onPress(data.id)} style={{ flex: 1 }}>
        <Body>
          <XStack items="center" gap={6}>
            <CategoryChip>
              <CategoryText>{categoryLabel}</CategoryText>
            </CategoryChip>
            <Writer numberOfLines={1} style={{ flexShrink: 1 }}>
              {data.user?.nickname ?? '탈퇴한 사용자'}
            </Writer>
          </XStack>
          <Title numberOfLines={1} ellipsizeMode="tail">
            {data.title}
          </Title>
          <Preview numberOfLines={2} ellipsizeMode="tail">
            {data.content ?? ''}
          </Preview>
          <CommunityAdoptCardStats comment={data.counts.comment} like={data.counts.like} view={data.counts.view} />
        </Body>
      </Pressable>

      <Right>
        {onPressLike && (
          <Pressable onPress={handlePressLike} hitSlop={8} testID={`qna-card-heart-${data.id}`}>
            <AnimatedHeart isLiked={data.isLiked} size={20} inactiveColor={black500.val} />
          </Pressable>
        )}
        {thumbnail ? <Thumbnail source={{ uri: thumbnail }} contentFit="cover" /> : null}
      </Right>
    </Container>
  );
};

const Container = styled(XStack, {
  py: 16,
  gap: 12
});

const Body = styled(YStack, {
  flex: 1,
  gap: 6
});

const Right = styled(YStack, {
  items: 'flex-end',
  gap: 8
});

const CategoryChip = styled(View, {
  px: 8,
  py: 4,
  rounded: 6,
  bg: '$white850'
});

const CategoryText = styled(Text, {
  fontSize: 11,
  color: '$primaryMain',
  fontWeight: '600'
});

const Writer = styled(Text, {
  fontSize: 12,
  color: '$black500'
});

const Title = styled(Text, {
  fontSize: 16,
  color: '$black900',
  fontWeight: '600'
});

const Preview = styled(Text, {
  fontSize: 13,
  color: '$black500',
  lineHeight: 18,
  minH: 36
});

const Thumbnail = styled(Image, {
  width: 72,
  height: 72,
  rounded: 8
});
