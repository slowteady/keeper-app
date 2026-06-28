import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { styled, View } from 'tamagui';

import { ModalPageHeader } from '@/shared/ui';

const SHARE_URL = process.env.EXPO_PUBLIC_SHARE_URL;

const Page = () => {
  return (
    <Container edges={['top']}>
      <ModalPageHeader title="이용약관" />
      <Body>
        <WebView
          source={{ uri: `${SHARE_URL}/policy/terms` }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          startInLoadingState
          renderLoading={() => (
            <Wrapper>
              <ActivityIndicator size="small" color="#8BC34A" />
            </Wrapper>
          )}
          scrollEnabled
          showsVerticalScrollIndicator={false}
        />
      </Body>
    </Container>
  );
};

export default Page;

const Container = styled(SafeAreaView, {
  bg: '$pageBackground',
  flex: 1
});

const Body = styled(View, {
  flex: 1,
  px: 20
});

const Wrapper = styled(View, {
  position: 'absolute',
  t: 0,
  l: 0,
  r: 0,
  b: 0,
  items: 'center',
  justify: 'center'
});
