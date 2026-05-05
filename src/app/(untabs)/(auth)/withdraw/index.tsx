import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, styled, Text, View, XStack, YStack } from 'tamagui';

import { useDeleteUser } from '@/features/auth';
import { Button } from '@/shared/ui';

const Page = () => {
  const { deleteUser, openWithdrawModal } = useDeleteUser();

  const reasons = useMemo(
    () => [
      '입양을 이미 완료했어요',
      '잠시 이용을 중단하고 싶어요',
      '원하는 정보나 기능을 찾기 어려웠어요',
      '앱 사용이 불편했어요 (속도, 알림, 오류 등)',
      '개인정보 보호나 알림 수신이 부담돼요',
      '탈퇴 후 재가입 할 거에요',
      '기타'
    ],
    []
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleWithdraw = useCallback(() => {
    openWithdrawModal(() => {
      deleteUser();
    });
  }, [openWithdrawModal, deleteUser]);

  return (
    <Container>
      <Text fontSize={26} lineHeight={40} fontWeight={600} letterSpacing={-0.25} color="$black900" mb={10}>
        {'Keeper를 탈퇴하는\n이유를 알려주세요'}
      </Text>
      <Text fontSize={14} lineHeight={16} fontWeight={400} letterSpacing={-0.25} color="$black500" mb={32}>
        더 나은 서비스를 위해 노력하겠습니다
      </Text>

      <YStack gap={12} mb={24}>
        {reasons.map((reason, index) => {
          const key = `${reason}-${index}`;
          const isSelected = selectedIndex === index;

          return (
            <ReasonItem key={key} onPress={() => setSelectedIndex(index)} isSelected={isSelected}>
              <ReasonText isSelected={isSelected}>{reason}</ReasonText>
            </ReasonItem>
          );
        })}
      </YStack>

      <XStack gap={8}>
        <Button style={{ flex: 1 }} onPress={() => router.back()}>
          돌아가기
        </Button>
        <Button style={{ flex: 1 }} color="tertiary" onPress={handleWithdraw}>
          탈퇴하기
        </Button>
      </XStack>
    </Container>
  );
};

export default Page;

const Container = styled(ScrollView, {
  bg: '$pageBackground',
  flex: 1,
  py: 40,
  px: 20
});

const ReasonItem = styled(View, {
  variants: {
    isSelected: {
      true: { bg: '$black800' },
      false: { bg: '$white850' }
    }
  } as const,
  rounded: 8,
  p: 20
});

const ReasonText = styled(Text, {
  variants: {
    isSelected: {
      true: { color: '$white900' },
      false: { color: '$black600' }
    }
  } as const,
  fontSize: 15,
  lineHeight: 17,
  letterSpacing: -0.25,
  fontWeight: 600
});
