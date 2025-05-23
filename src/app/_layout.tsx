import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import NaverLogin from '@react-native-seoul/naver-login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'expo-dev-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        staleTime: 0
      }
    }
  });

  useReactQueryDevTools(queryClient);

  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/PretendardVariable.ttf')
  });

  useEffect(() => {
    (async () => {
      // await enableMocking();
      if (loaded) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await SplashScreen.hideAsync();
        dayjs.extend(customParseFormat);

        const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY || '';
        initializeKakaoSDK(kakaoNativeAppKey);

        const consumerKey = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '';
        const consumerSecret = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET || '';
        const appName = process.env.EXPO_PUBLIC_NAVER_APP_NAME || '';
        const serviceUrlSchemeIOS = process.env.EXPO_PUBLIC_NAVER_URL_SCHEME || '';
        NaverLogin.initialize({
          appName,
          consumerKey,
          consumerSecret,
          serviceUrlSchemeIOS,
          disableNaverAppAuthIOS: true
        });

        const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
        GoogleSignin.configure({
          iosClientId
        });
      }
    })();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const enableMocking = async () => {
  if (!__DEV__) {
    return;
  }

  await import('../mocks/msw.polyfills');
  const { server } = await import('../mocks/server');
  server.listen({ onUnhandledRequest: 'bypass' });

  console.log('[MSW] Mock server started');
};
