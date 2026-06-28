import { router } from 'expo-router';
import { styled, View } from 'tamagui';

import { BottomButton } from '@/shared/ui';
import { InquiryHistoryScene } from '@/widgets/profile';

const Page = () => {
  return (
    <Container>
      <InquiryHistoryScene />
      <BottomButton onPress={() => router.push('/(untabs)/profile/inquiry/new')}>문의하기</BottomButton>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
