import MenuHeader from '@/components/organisms/headers/MenuHeader';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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
    SpaceMono: require('../assets/fonts/PretendardVariable.ttf')
  });

  useEffect(() => {
    (async () => {
      await enableMocking();
      if (loaded) {
        SplashScreen.hideAsync();
        dayjs.extend(customParseFormat);
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
            <Stack>
              <Stack.Screen
                name="menu"
                options={{
                  header: () => <MenuHeader />,
                  presentation: 'fullScreenModal'
                }}
              />
            </Stack>
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
