import { Toast } from '@/shared';
import { authApi } from '@/shared/utils/instance.util';
import { setupInterceptor } from '@/shared/utils/interceptors.utils';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import NaverLogin from '@react-native-seoul/naver-login';
import { ToastProvider } from '@tamagui/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { extend } from 'dayjs';
import 'dayjs/locale/ko';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'expo-dev-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { config } from '../../tamagui.config';
import AnimatedSplash from './AnimatedSplash';

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

  const [fontLoaded] = useFonts({
    'Pretendard-Regular': require('@/assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Bold': require('@/assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-Medium': require('@/assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('@/assets/fonts/Pretendard-SemiBold.otf')
  });

  const [isAppReady, setAppReady] = useState(false);
  const [isAnimationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!fontLoaded) return;

      extend(customParseFormat);
      setupInterceptor(authApi);

      const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY || '';
      const consumerKey = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '';
      const consumerSecret = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET || '';
      const appName = process.env.EXPO_PUBLIC_NAVER_APP_NAME || '';
      const serviceUrlSchemeIOS = process.env.EXPO_PUBLIC_NAVER_URL_SCHEME || '';
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

      initializeKakaoSDK(kakaoNativeAppKey);
      NaverLogin.initialize({
        appName,
        consumerKey,
        consumerSecret,
        serviceUrlSchemeIOS,
        disableNaverAppAuthIOS: true
      });
      GoogleSignin.configure({ webClientId, iosClientId });

      setAppReady(true);
    };

    init();
  }, [fontLoaded]);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady, isAnimationDone]);

  if (!isAppReady) {
    return null;
  }

  if (!isAnimationDone) {
    return <AnimatedSplash onFinish={() => setAnimationDone(true)} />;
  }

  return (
    <TamaguiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider native={false} swipeDirection="up">
            <Toast />
            <BottomSheetModalProvider>
              <SafeAreaProvider>
                <StatusBar style="dark" />
                <Stack screenOptions={{ headerShown: false }} />
              </SafeAreaProvider>
            </BottomSheetModalProvider>
          </ToastProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}

// const enableMocking = async () => {
//   if (!__DEV__) {
//     return;
//   }

//   await import('../shared/mocks/msw.polyfills');
//   const { server } = await import('../shared/mocks/server');
//   server.listen({ onUnhandledRequest: 'bypass' });

//   console.log('[MSW] Mock server started');
// };
