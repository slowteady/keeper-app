import 'dayjs/locale/ko';
import 'expo-dev-client';
import 'react-native-reanimated';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import NaverLogin from '@react-native-seoul/naver-login';
import * as Sentry from '@sentry/react-native';
import { ToastProvider } from '@tamagui/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { extend } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { authApi, setupInterceptor } from '@/shared/apis';
import { BottomSheetProvider, ModalProvider, Toast } from '@/shared/ui';

import { config } from '../../tamagui.config';
import AnimatedSplash from './AnimatedSplash';
import ErrorFallback from './ErrorFallback';

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration()],
  enabled: !__DEV__
});

const RootLayout = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 2
        // throwOnError:
      },
      mutations: {
        retry: false
        // throwOnError: throwToErrorBoundary
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

      initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY || '');
      NaverLogin.initialize({
        appName: process.env.EXPO_PUBLIC_NAVER_APP_NAME || '',
        consumerKey: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '',
        consumerSecret: process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET || '',
        serviceUrlSchemeIOS: process.env.EXPO_PUBLIC_NAVER_URL_SCHEME || '',
        disableNaverAppAuthIOS: true
      });
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || ''
      });

      setAppReady(true);
    };

    init();
  }, [fontLoaded]);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady, isAnimationDone]);

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('thirdPartyLoginResult')) {
        router.back();
        return;
      }
    });

    return () => sub.remove();
  }, []);

  if (!isAppReady) return null;
  if (!isAnimationDone) return <AnimatedSplash onFinish={() => setAnimationDone(true)} />;

  return (
    <TamaguiProvider config={config}>
      <Sentry.ErrorBoundary
        fallback={({ error, resetError }) => <ErrorFallback error={error} resetError={resetError} />}
      >
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <SafeAreaProvider>
                <BottomSheetProvider>
                  <ModalProvider>
                    <ToastProvider native={false} swipeDirection="up">
                      <StatusBar style="dark" />
                      <Toast />
                      <Stack screenOptions={{ headerShown: false }} />
                    </ToastProvider>
                  </ModalProvider>
                </BottomSheetProvider>
              </SafeAreaProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </TamaguiProvider>
  );
};

export default Sentry.wrap(RootLayout);
