import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { CommunityQnaListItemDto } from '../schema';

export type CommunityQnaCardProps = {
  data: CommunityQnaListItemDto;
  categoryLabel: string;
  animalLabel?: string;
  onPress: (id: number) => void;
};

export const CommunityQnaCard = ({ data, categoryLabel, animalLabel, onPress }: CommunityQnaCardProps) => {
  const thumbnail = data.images?.[0];

  return (
    <Container>
      <Pressable onPress={() => onPress(data.id)} style={{ flex: 1 }}>
        <YStack gap={8}>
          <XStack items="center" gap={6}>
            <CategoryChip>
              <CategoryText>{categoryLabel}</CategoryText>
            </CategoryChip>
            {animalLabel && (
              <AnimalChip>
                <AnimalText>{animalLabel}</AnimalText>
              </AnimalChip>
            )}
            <DisplayTime>{formatTimeAgo(data.displayTime)}</DisplayTime>
          </XStack>
          <Title numberOfLines={1} ellipsizeMode="tail">
            {data.title}
          </Title>
          {data.content ? (
            <Preview numberOfLines={2} ellipsizeMode="tail">
              {data.content}
            </Preview>
          ) : null}
          <XStack items="center" gap={10}>
            <Meta>답변 {data.counts.comment}</Meta>
            <Meta>도움돼요 {data.helpfulCount}</Meta>
          </XStack>
        </YStack>
      </Pressable>
      {thumbnail ? <Thumbnail source={{ uri: thumbnail }} contentFit="cover" /> : <ThumbnailPlaceholder />}
    </Container>
  );
};

const Container = styled(XStack, {
  py: 16,
  gap: 16,
  borderBottomWidth: 1,
  borderBottomColor: '$white800'
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

const AnimalChip = styled(View, {
  px: 8,
  py: 4,
  rounded: 6,
  bg: '$white700'
});

const AnimalText = styled(Text, {
  fontSize: 11,
  color: '$black500',
  fontWeight: '500'
});

const DisplayTime = styled(Text, {
  fontSize: 11,
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
  lineHeight: 18
});

const Meta = styled(Text, {
  fontSize: 12,
  color: '$black500'
});

const Thumbnail = styled(Image, {
  width: 72,
  height: 72,
  rounded: 8
});

const ThumbnailPlaceholder = styled(View, {
  width: 72,
  height: 72,
  rounded: 8,
  bg: '$white700'
});
