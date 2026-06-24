import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';
import { Checkbox } from '@/shared/ui';

import { NotificationDto } from '../schema';
import { NotificationTypeBadge } from './notification-type-badge';

export type NotificationItemProps = {
  data: NotificationDto;
  selectMode?: boolean;
  selected?: boolean;
  onPress: (data: NotificationDto) => void;
  onToggleSelect?: (id: string) => void;
};

export const NotificationItem = ({
  data,
  selectMode = false,
  selected = false,
  onPress,
  onToggleSelect
}: NotificationItemProps) => {
  const isRead = !!data.readAt;

  const handlePress = () => {
    if (selectMode) {
      onToggleSelect?.(data.id);
      return;
    }
    onPress(data);
  };

  return (
    <Pressable onPress={handlePress}>
      <Container opacity={isRead && !selectMode ? 0.5 : 1}>
        {selectMode && (
          <Checkbox checked={selected} variant="circle" size={22} onChange={() => onToggleSelect?.(data.id)} />
        )}
        <YStack flex={1} gap={6}>
          <XStack gap={6} items="center">
            <NotificationTypeBadge type={data.type} />
            <Meta>{formatTimeAgo(data.createdAt)}</Meta>
            {!isRead && <Dot />}
          </XStack>
          <Title numberOfLines={1} ellipsizeMode="tail">
            {data.title}
          </Title>
          <Body numberOfLines={2} ellipsizeMode="tail">
            {data.body}
          </Body>
        </YStack>
        {data.imageUrl ? (
          <Image
            source={{ uri: data.imageUrl }}
            contentFit="cover"
            style={{ width: 56, height: 56, borderRadius: 8 }}
          />
        ) : null}
      </Container>
    </Pressable>
  );
};

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

const Dot = styled(YStack, {
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

const Body = styled(Text, {
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 20,
  color: '$black500',
  letterSpacing: -0.28
});
