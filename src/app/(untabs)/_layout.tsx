import { Stack } from 'expo-router';

const UntabsLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="report" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
      <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
      <Stack.Screen name="community-guideline" options={{ presentation: 'modal' }} />
    </Stack>
  );
};

export default UntabsLayout;
