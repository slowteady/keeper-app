import { LogoHeader } from '@/entities';
import { Stack } from 'expo-router';

const AdoptLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <LogoHeader /> }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default AdoptLayout;
