import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { TamaguiProvider } from 'tamagui';

import { config } from '../../tamagui.config';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  });

export const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <TamaguiProvider config={config} defaultTheme="light">
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NavigationContainer>
    </TamaguiProvider>
  );
};
