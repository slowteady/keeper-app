import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const Layout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="커뮤니티 가이드라인" hideHome /> }} />;
};

export default Layout;
