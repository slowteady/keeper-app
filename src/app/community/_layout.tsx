import { Pencil } from '@/components/atoms/icons/outline';
import { Button } from '@/shared/components/atoms/Button';
import { DetailHeader } from '@/shared/components/organisms/DetailHeader';
import { theme } from '@/shared/constants/theme.constants';
import { Stack } from 'expo-router';
import ErrorBoundary from 'react-native-error-boundary';
import ErrorFallback from '../ErrorFallback';

const CommunityLayout = () => {
  const handlePressWrite = () => {
    // TODO: write 페이지 이동
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <DetailHeader rightHeader={<WriteButton onPress={handlePressWrite} />} />
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
};

export default CommunityLayout;

const WriteButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Button onPress={onPress} style={{}}>
      <Pencil width={24} height={24} color={theme.colors.black[800]} />
    </Button>
  );
};
