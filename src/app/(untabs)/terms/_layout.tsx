import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const PolicyLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="이용약관" hideHome /> }} />;
};

export default PolicyLayout;
