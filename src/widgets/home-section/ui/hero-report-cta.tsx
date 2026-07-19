import { ChevronRight, Siren } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

import { MISSING_RED } from '@/shared/lib';

export const HeroReportCta = () => {
  const router = useRouter();
  const { white900 } = useTheme();

  return (
    <XStack
      items="center"
      justify="space-between"
      rounded={12}
      py={16}
      px={18}
      bg="$white850"
      overflow="hidden"
      mt={12}
    >
      <YStack gap={2}>
        <Prompt>잃어버린 아이가 있나요?</Prompt>
        <Sub>지금 바로 실종 신고를 남겨보세요</Sub>
      </YStack>
      <Pressable
        onPress={() => router.push('/missing/write')}
        accessibilityRole="button"
        accessibilityLabel="실종 신고하기"
        hitSlop={6}
      >
        <Action>
          <Siren size={15} color={white900.val as never} />
          <ActionText>실종 신고하기</ActionText>
          <ChevronRight size={16} color={white900.val as never} />
        </Action>
      </Pressable>
      <Accent />
    </XStack>
  );
};

const Prompt = styled(Text, {
  fontSize: 15,
  lineHeight: 20,
  fontWeight: '700',
  color: '$black900'
});

const Sub = styled(Text, {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '500',
  color: '$black600'
});

const Action = styled(XStack, {
  items: 'center',
  gap: 3,
  px: 12,
  py: 8,
  rounded: 999,
  bg: MISSING_RED
});

const ActionText = styled(Text, {
  fontSize: 13,
  lineHeight: 16,
  fontWeight: '700',
  color: '$white900'
});

const Accent = styled(YStack, {
  position: 'absolute',
  l: 0,
  t: 0,
  b: 0,
  width: 4,
  bg: MISSING_RED
});
