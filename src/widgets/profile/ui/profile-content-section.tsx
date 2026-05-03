import { ChevronRight } from '@tamagui/lucide-icons';
import { styled, Text, View, XStack, YStack } from 'tamagui';

type ProfileContentSectionProps = {
  version: string | null;
  onReview: () => void;
  onShare: () => void;
};

export const ProfileContentSection = ({ version, onReview, onShare }: ProfileContentSectionProps) => {
  return (
    <View px={20} mb={16}>
      <YStack px={16} py={20} bg="$white850" rounded={10}>
        <XStack mb={12} items="center" justify="space-between">
          <YStack gap={8}>
            <Title>리뷰 작성하기</Title>
            <SubTitle>따뜻한 리뷰는 운영에 큰 힘이됩니다.</SubTitle>
          </YStack>

          <XStack items="center" gap={2} onPress={onReview} hitSlop={10}>
            <Text fontSize={12} fontWeight="600" color="$black500" letterSpacing={-0.25}>
              바로가기
            </Text>
            <ChevronRight size={12} color="$black500" />
          </XStack>
        </XStack>

        <Divider mb={12} />

        <XStack items="center" justify="space-between">
          <YStack gap={8}>
            <Title>친구에게 공유하기</Title>
            <SubTitle>ver. {version}</SubTitle>
          </YStack>

          <XStack items="center" gap={2} hitSlop={10} onPress={onShare}>
            <Text fontSize={12} fontWeight="600" color="$black500" letterSpacing={-0.25}>
              공유하기
            </Text>
            <ChevronRight size={12} color="$black500" />
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
  letterSpacing: -0.25
});

const SubTitle = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.25
});
