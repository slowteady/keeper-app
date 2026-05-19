import { BottomSheetFooter, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useState } from 'react';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button, Checkbox } from '@/shared/ui';

export type CommunityPolicyContentProps = {
  onConfirm: () => void;
  isPending?: boolean;
};

export const CommunityPolicyContent = ({ onConfirm, isPending }: CommunityPolicyContentProps) => {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (!agreed || isPending) return;
    onConfirm();
  };

  return (
    <YStack flex={1} pt={8} gap={20} testID="community-policy-sheet" accessible={false}>
      <Title>커뮤니티 이용을 위한{'\n'}약관에 동의해주세요</Title>

      <ItemRow>
        <ItemLeft onPress={() => setAgreed((prev) => !prev)} testID="community-policy-checkbox">
          <Checkbox variant="icon" size={24} checked={agreed} onChange={setAgreed} />
          <ItemLabel>(필수) 커뮤니티 가이드라인 동의</ItemLabel>
        </ItemLeft>
        <ViewChip onPress={() => router.push('/community-policy')}>
          <ViewChipText>보기</ViewChipText>
        </ViewChip>
      </ItemRow>

      <ConfirmButton agreed={agreed} isPending={isPending} onPress={handleConfirm} />
    </YStack>
  );
};

const ConfirmButton = ({
  agreed,
  isPending,
  onPress
}: {
  agreed: boolean;
  isPending?: boolean;
  onPress: () => void;
}) => {
  const { bottom } = useLayout();
  return (
    <View position="absolute" b={bottom || 16} l={0} r={0}>
      <Button
        size="large"
        style={{ borderRadius: 10 }}
        onPress={onPress}
        disabled={!agreed || isPending}
        isLoading={isPending}
        testID="community-policy-confirm"
      >
        동의하고 시작하기
      </Button>
    </View>
  );
};

export const renderCommunityPolicyFooter =
  ({
    agreed,
    onConfirm,
    isPending,
    bottom
  }: {
    agreed: boolean;
    onConfirm: () => void;
    isPending?: boolean;
    bottom: number;
  }) =>
  (footerProps: BottomSheetFooterProps) => (
    <BottomSheetFooter {...footerProps} bottomInset={0}>
      <View pt={12} pb={bottom || 16} bg="$white900">
        <Button
          size="large"
          style={{ borderRadius: 10 }}
          onPress={onConfirm}
          disabled={!agreed || isPending}
          isLoading={isPending}
        >
          동의하고 시작하기
        </Button>
      </View>
    </BottomSheetFooter>
  );

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
