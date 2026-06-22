import { ChevronRight, Megaphone } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

import { NoticeTypeBadge } from '@/entities/notice';
import { getLatestNotice, isNoticeFresh, useNoticeList, useReadNotices } from '@/features/notice';
import { SCREEN_GUTTER } from '@/shared/lib';

export const HomeNoticeSection = () => {
  const router = useRouter();
  const { items } = useNoticeList();
  const { readIds } = useReadNotices();

  const goDetail = useCallback(
    (id: string) => router.push({ pathname: '/(untabs)/profile/notice/[id]', params: { id } } as never),
    [router]
  );

  if (items.length === 0) return null;

  const latest = getLatestNotice(items);
  const unread = isNoticeFresh(latest.createdAt) && !readIds.includes(latest.id);

  return (
    <View px={SCREEN_GUTTER} pt={16} pb={8}>
      <Bar onPress={() => goDetail(latest.id)}>
        <Megaphone size={17} color="$black600" />
        {latest.type === 'URGENT' && <NoticeTypeBadge type="URGENT" />}
        <Title numberOfLines={1} ellipsizeMode="tail">
          {latest.title}
        </Title>
        {unread && <Dot />}
        <ChevronRight size={18} color="#ADB3AF" />
      </Bar>
    </View>
  );
};

const Bar = styled(XStack, {
  items: 'center',
  gap: 8,
  px: 14,
  py: 12,
  rounded: 12,
  bg: '$white850',
  pressStyle: { opacity: 0.7 }
});

const Title = styled(Text, {
  flex: 1,
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 19,
  color: '$black800',
  letterSpacing: -0.28
});

const Dot = styled(View, {
  width: 6,
  height: 6,
  rounded: 3,
  bg: '$errorMain'
});
