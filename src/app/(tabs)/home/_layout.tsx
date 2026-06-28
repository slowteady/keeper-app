import { Stack } from 'expo-router';

import { NotificationBell } from '@/features/notification';
import { LogoHeader } from '@/shared/ui';

const HomeLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader right={<NotificationBell />} /> }} />;
};

export default HomeLayout;
