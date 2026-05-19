import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { CommunityWriteHeader } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';
import { useRequireCommunityPolicy } from '@/features/community';

const CommunityLayout = () => {
  const router = useRouter();
  const { requireLogin } = useLoginRequired();
  const { requirePolicy } = useRequireCommunityPolicy();

  const handlePressWrite = useCallback(async () => {
    await requireLogin(async () => {
      await requirePolicy(() => {
        router.push('/community/write');
      });
    });
  }, [requireLogin, requirePolicy, router]);

  return <Stack screenOptions={{ header: () => <CommunityWriteHeader onPressWrite={handlePressWrite} /> }} />;
};

export default CommunityLayout;
