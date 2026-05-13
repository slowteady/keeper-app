import { BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { forwardRef, useCallback, useMemo } from 'react';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { BottomButton, BottomSheet, Checkbox } from '@/shared/ui';

export type CommunityPolicyBottomSheetProps = {
  agreed: boolean;
  onChangeAgreed: (next: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export const CommunityPolicyBottomSheet = forwardRef<BottomSheetModal, CommunityPolicyBottomSheetProps>(
  ({ agreed, onChangeAgreed, onConfirm, isPending }, ref) => {
    const snapPoints = useMemo(() => ['40%'], []);

    // BP: BottomSheetFooter 로 sticky 처리 — 스크롤 무관 하단 고정 + 키보드 대응
    const renderFooter = useCallback(
      (footerProps: React.ComponentProps<typeof BottomSheetFooter>) => (
        <BottomSheetFooter {...footerProps} bottomInset={0}>
          <View pb={24} pt={12} bg="$white900">
            <BottomButton onPress={onConfirm} disabled={!agreed || isPending}>
              동의하고 시작하기
            </BottomButton>
          </View>
        </BottomSheetFooter>
      ),
      [agreed, isPending, onConfirm]
    );

    return (
      <BottomSheet ref={ref} snapPoints={snapPoints} footerComponent={renderFooter}>
        <YStack flex={1} pt={8} gap={20}>
          <Title>커뮤니티 이용을 위한{'\n'}약관에 동의해주세요</Title>

          <ItemRow>
            <ItemLeft onPress={() => onChangeAgreed(!agreed)}>
              <Checkbox variant="icon" size={24} checked={agreed} onChange={onChangeAgreed} />
              <ItemLabel>(필수) 커뮤니티 가이드라인 동의</ItemLabel>
            </ItemLeft>
            <ViewChip onPress={() => router.push('/community-policy')}>
              <ViewChipText>보기</ViewChipText>
            </ViewChip>
          </ItemRow>
        </YStack>
      </BottomSheet>
    );
  }
);

CommunityPolicyBottomSheet.displayName = 'CommunityPolicyBottomSheet';

const Title = styled(Text, {
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.4
});

const ItemRow = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  py: 8
});

const ItemLeft = styled(XStack, {
  items: 'center',
  gap: 10,
  flex: 1
});

const ItemLabel = styled(Text, {
  fontSize: 15,
  lineHeight: 15,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.15
});

const ViewChip = styled(XStack, {
  items: 'center',
  justify: 'center',
  bg: '$white850',
  px: 8,
  py: 6,
  rounded: 4,
  hitSlop: 6
});

const ViewChipText = styled(Text, {
  fontSize: 13,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.26
});
