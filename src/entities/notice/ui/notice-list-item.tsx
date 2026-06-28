import { ChevronRight, Pin } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { NoticeListItemDto } from '../schema';
import { NoticeTypeBadge } from './notice-type-badge';

export type NoticeListItemProps = {
  data: NoticeListItemDto;
  isRead?: boolean;
  unread?: boolean;
  onPress: (id: string) => void;
};

export const NoticeListItem = ({ data, isRead = false, unread = false, onPress }: NoticeListItemProps) => (
  <Pressable onPress={() => onPress(data.id)}>
    <Container opacity={isRead ? 0.5 : 1}>
      <YStack flex={1} gap={6}>
        <XStack gap={6} items="center">
          {data.isPinned && <Pin size={13} color="$black700" />}
          <NoticeTypeBadge type={data.type} />
          <Meta>{formatTimeAgo(data.createdAt)}</Meta>
          {unread && <Dot />}
        </XStack>
        <Title numberOfLines={2} ellipsizeMode="tail">
          {data.title}
        </Title>
      </YStack>
      <ChevronRight size={16} color="#ADB3AF" />
    </Container>
  </Pressable>
);

const Container = styled(XStack, {
  py: 16,
  gap: 12,
  items: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '$white850'
});

const Meta = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.24
});

const Dot = styled(View, {
  width: 6,
  height: 6,
  rounded: 3,
  bg: '$errorMain'
});

const Title = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 23,
  color: '$black900',
  letterSpacing: -0.4
});
