import * as Application from 'expo-application';
import { router } from 'expo-router';
import { ScrollView, Separator, styled, Text, View, YStack } from 'tamagui';

import { Menu } from '@/shared/ui';

const Page = () => {
  const version = Application.nativeApplicationVersion;

  return (
    <Container>
      <ScrollView py={32}>
        <YStack px={20} mb={24}>
          <NavText mb={6}>약관 및 정책</NavText>
          <Menu label="이용약관" style={{ paddingVertical: 14 }} onPress={() => router.push('/terms')} />
          <Menu label="개인정보처리방침" style={{ paddingVertical: 14 }} onPress={() => router.push('/privacy')} />
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={20} gap={6}>
          <Label>버전 정보</Label>
          <Text fontSize={14} fontWeight="500" lineHeight={16} letterSpacing={-0.25} color="$white600">
            현재버전 {version}
          </Text>
        </YStack>
      </ScrollView>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Label = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 21,
  color: '$black900',
  letterSpacing: -0.25
});

const NavText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black500'
});
