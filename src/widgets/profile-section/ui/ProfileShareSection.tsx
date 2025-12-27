import { ChevronRight } from '@tamagui/lucide-icons';
import * as Application from 'expo-application';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { useReview, useShare } from '@/shared';

export const ProfileShareSection = () => {
  const { actions: shareActions } = useShare();
  const { actions: reviewActions } = useReview();

  const version = Application.nativeApplicationVersion;

  return (
    <Container>
      <Cell mb={12}>
        <LeftColumn>
          <Title>리뷰 작성하기</Title>
          <SubTitle>따뜻한 리뷰는 운영에 큰 힘이됩니다.</SubTitle>
        </LeftColumn>

        <RightColumn onPress={reviewActions.promptReview} hitSlop={10}>
          <Text fontSize={12} fontWeight="600" color="$black500" letterSpacing={-0.25}>
            바로가기
          </Text>
          <ChevronRight size={12} color="$black500" />
        </RightColumn>
      </Cell>

      <Divider mb={12} />

      <Cell>
        <LeftColumn>
          <Title>친구에게 공유하기</Title>
          <SubTitle>ver. {version}</SubTitle>
        </LeftColumn>

        <RightColumn
          hitSlop={10}
          onPress={() => shareActions.share({ title: 'Keeper', desc: '유기동물들의 가족이 되어주세요' })}
        >
          <Text fontSize={12} fontWeight="600" color="$black500" letterSpacing={-0.25}>
            공유하기
          </Text>
          <ChevronRight size={12} color="$black500" />
        </RightColumn>
      </Cell>
    </Container>
  );
};

const Container = styled(YStack, {
  px: 16,
  py: 20,
  bg: '$white850',
  rounded: 10
});

const Cell = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

const LeftColumn = styled(YStack, {
  gap: 8
});

const RightColumn = styled(XStack, {
  items: 'center',
  gap: 2
});

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
