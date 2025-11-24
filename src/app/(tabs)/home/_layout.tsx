import { LogoHeader } from '@/entities';
import { Stack } from 'expo-router';

const HomeLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default HomeLayout;
