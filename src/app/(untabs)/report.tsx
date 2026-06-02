import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled, Text, View, YStack } from 'tamagui';

import { REPORT_REASONS, type ReportReason, useReport } from '@/features/community/safety';
import { Menu, ModalPageHeader } from '@/shared/ui';

const Page = () => {
  const params = useLocalSearchParams<{ type?: string; id?: string }>();
  const targetType: 'POST' | 'COMMENT' = params.type === 'COMMENT' ? 'COMMENT' : 'POST';
  const targetId = params.id;

  const { report, isPending } = useReport();

  if (!targetId) {
    router.back();
    return null;
  }

  const handleSelect = async (reason: ReportReason) => {
    if (isPending) return;
    await report({ type: targetType, id: targetId }, reason);
    router.back();
  };

  return (
    <Container edges={[]}>
      <ModalPageHeader title="신고하기" fullScreen />
      <YStack flex={1} px={20}>
        <Title>신고하는 이유를 선택해 주세요</Title>
        <InfoBox>
          <InfoText>접수된 신고는 운영자가 검토 후 처리합니다.</InfoText>
        </InfoBox>
        <YStack>
          {REPORT_REASONS.map((reason, idx) => (
            <ReasonWrap key={reason.id} isFirst={idx === 0}>
              <Menu label={reason.label} onPress={() => handleSelect(reason.id)} style={{ paddingVertical: 18 }} />
            </ReasonWrap>
          ))}
        </YStack>
      </YStack>
    </Container>
  );
};

export default Page;

const Container = styled(SafeAreaView, {
  flex: 1,
  bg: '$pageBackground'
});

const Title = styled(Text, {
  fontSize: 22,
  fontWeight: '700',
  color: '$black900',
  mt: 16,
  mb: 20,
  lineHeight: 28
});

const InfoBox = styled(View, {
  bg: '$white800',
  rounded: 8,
  px: 16,
  py: 14,
  mb: 16
});

const InfoText = styled(Text, {
  fontSize: 13,
  lineHeight: 19,
  color: '$black600'
});

const ReasonWrap = styled(View, {
  borderTopWidth: 1,
  borderColor: '$white800',
  variants: {
    isFirst: {
      true: { borderTopWidth: 0 }
    }
  } as const
});
