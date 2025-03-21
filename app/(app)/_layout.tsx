import MainHeader from '@/components/organisms/headers/MainHeader';
import { Drawer } from 'expo-router/drawer';
import ErrorBoundary from 'react-native-error-boundary';
import ErrorFallback from '../ErrorFallback';

const DrawerLayout = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Drawer screenOptions={{ drawerPosition: 'right' }}>
        <Drawer.Screen name="index" options={{ header: () => <MainHeader /> }} />
      </Drawer>
    </ErrorBoundary>
  );
};

export default DrawerLayout;
