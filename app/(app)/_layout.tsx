import { HeartIcon } from '@/components/atoms/icons/HeartIcon';
import { LocationIcon } from '@/components/atoms/icons/LocationIcon';
import MainHeader from '@/components/organisms/headers/MainHeader';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Route, router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import ErrorFallback from '../ErrorFallback';

const DrawerLayout = () => {
  const drawerWidth = (Dimensions.get('window').width * 2) / 3;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Drawer
        drawerContent={(props) => <MenuList {...props} />}
        screenOptions={{
          drawerPosition: 'right',
          drawerType: 'front',
          drawerStyle: { width: drawerWidth }
        }}
      >
        <Drawer.Screen name="index" options={{ header: () => <MainHeader /> }} />
      </Drawer>
    </ErrorBoundary>
  );
};

export default DrawerLayout;

const MenuList = ({ ...props }: DrawerContentComponentProps) => {
  const { top } = useLayout();
  const headerTop = top + 39;

  const handleRoute = (link: Route) => {
    props.navigation.closeDrawer();
    router.push(link);
  };

  return (
    <View style={[styles.container, { top: headerTop }]}>
      <Pressable style={styles.menuWrap} onPress={() => handleRoute('/abandonments')}>
        <HeartIcon width={24} height={24} />
        <Text style={styles.text}>입양공고</Text>
      </Pressable>
      <Pressable style={styles.menuWrap} onPress={() => handleRoute('/shelters')}>
        <LocationIcon width={24} height={24} />
        <Text style={styles.text}>보호소</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 32
  },
  menuWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  text: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '500',
    color: theme.colors.black[800]
  }
});
