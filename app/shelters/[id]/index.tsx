import DetailHeader from '@/components/organisms/headers/DetailHeader';
import { Stack, useLocalSearchParams } from 'expo-router';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />
    </>
  );
};

export default Page;
