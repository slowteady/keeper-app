import DetailHeader from '@/components/organisms/headers/DetailHeader';
import { Stack } from 'expo-router';

const AbandonmentsLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: true, header: () => <DetailHeader /> }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
    </Stack>
  );
};

export default AbandonmentsLayout;
