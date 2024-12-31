import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
      }
    })();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'initial'
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
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
