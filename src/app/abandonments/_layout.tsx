import DetailHeader from '@/components/organisms/headers/DetailHeader';
import { Stack } from 'expo-router';
import ErrorBoundary from 'react-native-error-boundary';
import ErrorFallback from '../ErrorFallback';

const AbandonmentsLayout = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Stack screenOptions={{ headerShown: true, header: () => <DetailHeader /> }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]/index" />
      </Stack>
    </ErrorBoundary>
  );
};

export default AbandonmentsLayout;
