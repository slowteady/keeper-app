import dayjs from 'dayjs';
import { Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

import type { BlockedUserDto } from '@/entities/community';
import { ProfileAvatar } from '@/entities/profile';

export type BlockListRowProps = {
  user: BlockedUserDto;
  onUnblock: () => void;
  isPending: boolean;
};

export const BlockListRow = ({ user, onUnblock, isPending }: BlockListRowProps) => {
  return (
    <Row>
      <XStack items="center" gap={12} flex={1}>
        <ProfileAvatar image={user.image} size={48} />
        <YStack flex={1} gap={4}>
          <Nickname numberOfLines={1}>{user.nickname || '탈퇴한 사용자'}</Nickname>
          <BlockedAt>{formatBlockedAt(user.blockedAt)}</BlockedAt>
        </YStack>
      </XStack>
      <Pressable onPress={onUnblock} disabled={isPending} hitSlop={8} style={styles.button}>
        <UnblockText>차단 해제</UnblockText>
      </Pressable>
    </Row>
  );
};

const formatBlockedAt = (iso: string): string => {
  const now = dayjs();
  const then = dayjs(iso);
  if (!then.isValid()) return '';
  const diffDays = now.startOf('day').diff(then.startOf('day'), 'day');
  if (diffDays === 0) return '오늘 차단';
  if (diffDays < 7) return `${diffDays}일 전 차단`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전 차단`;
  return `${then.format('YYYY.MM.DD')} 차단`;
};

const styles = {
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7E6',
    backgroundColor: 'transparent'
  }
} as const;

const Row = styled(XStack, {
  px: 20,
  py: 14,
  items: 'center',
  justify: 'space-between',
  gap: 12
});

const Nickname = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  color: '$black900',
  letterSpacing: -0.25
});

const BlockedAt = styled(Text, {
  fontSize: 13,
  fontWeight: '400',
  color: '$black500',
  letterSpacing: -0.25
});

const UnblockText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  color: '$black700',
  letterSpacing: -0.25
});
