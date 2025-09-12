import 'dayjs/locale/ko';
import 'expo-dev-client';
import 'react-native-reanimated';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import NaverLogin from '@react-native-seoul/naver-login';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import * as Sentry from '@sentry/react-native';
import { ToastProvider } from '@tamagui/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { extend } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { DrawerMenus } from '@/domains/category';
import { Toast } from '@/shared/components/_molecules';
import { BottomSheetProvider } from '@/shared/components/_organisms/BottomSheet';
import { ModalProvider } from '@/shared/components/_organisms/Modal';
import { throwToErrorBoundary } from '@/shared/utils';
import { authApi } from '@/shared/utils/instance.util';
import { setupInterceptor } from '@/shared/utils/interceptors.utils';

import { config } from '../../tamagui.config';
import AnimatedSplash from './AnimatedSplash';
import ErrorFallback from './ErrorFallback';

/**
 * TODO
 * [x] 라우팅 다시 구현
 * [x] 기존에 데이터 요청 로직들 axios instance로 변경 및 리팩토링
 * [x] 로거 유틸 함수 추가
 * [x] 에러바운더리 설정
 * [x] 로그인, 비로그인 구분하여 파일 경로 구현
 * [ ] 커뮤니티 ui 구현
 * [ ] DDD에 맞게 컴포넌트 분리
 * [ ] tamagui에 맞게 컴포넌트 리팩토링
 * [ ] FlatList -> FlashList로 전환
 */
const DRAWER_WIDTH = (Dimensions.get('window').width * 2) / 3;

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
        staleTime: 1000 * 60 * 2,
        throwOnError: throwToErrorBoundary
      },
      mutations: {
        retry: false,
        throwOnError: throwToErrorBoundary
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
                      <Drawer
                        drawerContent={(props: DrawerContentComponentProps) => <DrawerMenus {...props} />}
                        screenOptions={{
                          drawerPosition: 'right',
                          drawerType: 'front',
                          drawerStyle: { width: DRAWER_WIDTH },
                          headerShown: false
                        }}
                      >
                        <Drawer.Screen name="(home)" />
                      </Drawer>
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
