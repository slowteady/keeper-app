import { Stack } from 'expo-router';
import ErrorBoundary from 'react-native-error-boundary';

import { useAuth } from '@/domains/auth/hooks';
import { DetailHeader } from '@/shared/components/organisms/DetailHeader';

import ErrorFallback from '../ErrorFallback';

const LoginLayout = () => {
  useAuth();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Stack screenOptions={{ headerShown: true, header: () => <DetailHeader /> }}>
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
};

export default LoginLayout;
