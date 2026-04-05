import { Stack, useRouter } from 'expo-router';

import { CommunityWriteHeader } from '@/entities/community';

const CommunityLayout = () => {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{ header: () => <CommunityWriteHeader onPressWrite={() => router.push('/community/write')} /> }}
    />
  );
};

export default CommunityLayout;
