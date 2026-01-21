import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const NicknameLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default NicknameLayout;
