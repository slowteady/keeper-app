import { Pressable } from 'react-native';
import { styled, Text, XStack } from 'tamagui';

import { SCREEN_GUTTER } from '@/shared/lib';

export type NotificationListBarProps = {
  total: number;
  selectMode: boolean;
  selectedCount: number;
  onMarkAllRead: () => void;
  onDeleteSelected: () => void;
  onCloseSelectMode: () => void;
};

export const NotificationListBar = ({
  total,
  selectMode,
  selectedCount,
  onMarkAllRead,
  onDeleteSelected,
  onCloseSelectMode
}: NotificationListBarProps) => (
  <Container>
    {selectMode ? (
      <>
        <Count>{selectedCount}개 선택됨</Count>
        <XStack gap={16} items="center">
          <Pressable onPress={onDeleteSelected} disabled={selectedCount === 0}>
            <ActionText tone="danger" opacity={selectedCount === 0 ? 0.4 : 1}>
              전체 삭제
            </ActionText>
          </Pressable>
          <Pressable onPress={onCloseSelectMode}>
            <ActionText>닫기</ActionText>
          </Pressable>
        </XStack>
      </>
    ) : (
      <>
        <Count>{total}개의 알림이 있습니다.</Count>
        <Pressable onPress={onMarkAllRead}>
          <ActionText>모두 읽기</ActionText>
        </Pressable>
      </>
    )}
  </Container>
);

const Container = styled(XStack, {
  px: SCREEN_GUTTER,
  py: 12,
  items: 'center',
  justify: 'space-between',
  bg: '$white900'
});

const Count = styled(Text, {
  fontSize: 13,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.26
});

const ActionText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  color: '$black700',
  letterSpacing: -0.26,
  variants: {
    tone: {
      danger: { color: '$errorMain' }
    }
  } as const
});
