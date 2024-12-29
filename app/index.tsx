import MainTemplate from '@/components/templates/MainTemplate';
import { AbandonmentsProvider } from '@/state/AbandonmentsProvider';
import { Stack } from 'expo-router';

const Page = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <AbandonmentsProvider>
        <MainTemplate />
      </AbandonmentsProvider>
    </>
  );
};

export default Page;
