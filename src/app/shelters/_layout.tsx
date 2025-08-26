import { Stack } from 'expo-router';
import ErrorBoundary from 'react-native-error-boundary';

import { DetailHeader } from '@/shared/components/organisms/DetailHeader';

import ErrorFallback from '../ErrorFallback';

const SheltersLayout = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Stack screenOptions={{ headerShown: true, header: () => <DetailHeader /> }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]/index" />
      </Stack>
    </ErrorBoundary>
  );
};

export default SheltersLayout;
