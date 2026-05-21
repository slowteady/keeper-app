import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { CommunityWriteHeader } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';

const CommunityLayout = () => {
  const router = useRouter();
  const { requireLogin } = useLoginRequired();

  const handlePressWrite = useCallback(async () => {
    await requireLogin(() => {
      router.push('/community/write');
    });
  }, [requireLogin, router]);

  return <Stack screenOptions={{ header: () => <CommunityWriteHeader onPressWrite={handlePressWrite} /> }} />;
};

export default CommunityLayout;
