import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const Layout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="차단 관리" hideHome /> }} />;
};

export default Layout;
