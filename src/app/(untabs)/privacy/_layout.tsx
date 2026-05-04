import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const PolicyLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="개인정보처리방침" hideHome /> }} />;
};

export default PolicyLayout;
