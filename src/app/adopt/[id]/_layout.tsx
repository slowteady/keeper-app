import { NavigateHeader } from '@/entities';
import { Stack } from 'expo-router';

const AdoptDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default AdoptDetailLayout;
