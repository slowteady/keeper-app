import { Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { NoticeListItemDto } from '../schema';
import { NoticeTypeBadge } from './notice-type-badge';

export type NoticeCardProps = {
  data: NoticeListItemDto;
  onPress: (id: string) => void;
};

export const NoticeCard = ({ data, onPress }: NoticeCardProps) => (
  <Pressable onPress={() => onPress(data.id)}>
    <Card>
      <XStack gap={6} items="center">
        <NoticeTypeBadge type={data.type} />
        <Meta>{formatTimeAgo(data.createdAt)}</Meta>
      </XStack>
      <Title numberOfLines={1} ellipsizeMode="tail">
        {data.title}
      </Title>
    </Card>
  </Pressable>
);

const Card = styled(YStack, {
  gap: 8,
  p: 16,
  rounded: 12,
  bg: '$white900',
  borderWidth: 1,
  borderColor: '$white850'
});

const Meta = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.24
});

const Title = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  lineHeight: 23,
  color: '$black900',
  letterSpacing: -0.4
});
