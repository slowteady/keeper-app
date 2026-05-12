import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { styled, View } from 'tamagui';

const SHARE_URL = process.env.EXPO_PUBLIC_SHARE_URL;

const Page = () => {
  return (
    <Container>
      <WebView
        source={{ uri: `${SHARE_URL}/policy/community` }}
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
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Wrapper = styled(View, {
  flex: 1,
  items: 'center',
  justify: 'center'
});
