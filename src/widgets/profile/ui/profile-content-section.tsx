import { ChevronRight } from '@tamagui/lucide-icons';
import * as Application from 'expo-application';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { useReview, useShare } from '@/shared/model';

export const ProfileContentSection = () => {
  const version = Application.nativeApplicationVersion;

  const { share } = useShare();
  const { promptReview } = useReview();

  return (
    <View px={20} mb={16}>
      <YStack px={16} py={20} bg="$white850" rounded={10}>
        <XStack mb={12} items="center" justify="space-between">
          <YStack gap={8}>
            <Title>리뷰 작성하기</Title>
            <SubTitle>따뜻한 리뷰는 운영에 큰 힘이됩니다.</SubTitle>
          </YStack>

          <XStack items="center" gap={2} onPress={promptReview} hitSlop={10}>
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

          <XStack
            items="center"
            gap={2}
            hitSlop={10}
            onPress={() => share({ title: 'Keeper', desc: '유기동물들의 가족이 되어주세요' })}
          >
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
