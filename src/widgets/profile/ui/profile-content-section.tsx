import { ChevronRight } from '@tamagui/lucide-icons';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { REVIEW_CARD_DESC, SHARE_CARD_DESC } from '@/features/profile';

type ProfileContentSectionProps = {
  onReview: () => void;
  onShare: () => void;
};

export const ProfileContentSection = ({ onReview, onShare }: ProfileContentSectionProps) => {
  return (
    <View px={20} mb={16}>
      <YStack px={16} py={20} bg="$white850" rounded={10}>
        <XStack mb={12} items="center" justify="space-between">
          <YStack gap={8} flex={1} pr={12}>
            <Title>리뷰 작성하기</Title>
            <SubTitle>{REVIEW_CARD_DESC}</SubTitle>
          </YStack>

          <XStack items="center" gap={2} onPress={onReview} hitSlop={10}>
            <Action>작성하기</Action>
            <ChevronRight size={12} color="#868B88" strokeWidth={2} />
          </XStack>
        </XStack>

        <Divider mb={12} />

        <XStack items="center" justify="space-between">
          <YStack gap={8} flex={1} pr={12}>
            <Title>친구에게 공유하기</Title>
            <SubTitle>{SHARE_CARD_DESC}</SubTitle>
          </YStack>

          <XStack items="center" gap={2} hitSlop={10} onPress={onShare}>
            <Action>공유하기</Action>
            <ChevronRight size={12} color="#868B88" strokeWidth={2} />
          </XStack>
        </XStack>
      </YStack>
    </View>
  );
};

const Divider = styled(View, {
  height: 1,
  bg: '$white800'
});

const Title = styled(Text, {
  fontSize: 15,
  fontWeight: '600',
  color: '$black700',
  letterSpacing: -0.3
});

const SubTitle = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.12
});

const Action = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  color: '$black500',
  letterSpacing: -0.24
});
