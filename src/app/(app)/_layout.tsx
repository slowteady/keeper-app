import { Heart, Location } from '@/components/atoms/icons/outline';
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
        drawerContent={(props: any) => <MenuList {...props} />}
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
    setTimeout(() => router.push(link), 500);
  };

  return (
    <View style={[styles.container, { top: headerTop }]}>
      <Pressable style={styles.menuWrap} onPress={() => handleRoute('/abandonments')}>
        <Heart width={24} height={24} color={theme.colors.black[900]} />
        <Text style={styles.text}>입양공고</Text>
      </Pressable>
      <Pressable style={styles.menuWrap} onPress={() => handleRoute('/shelters')}>
        <Location width={24} height={24} color={theme.colors.black[900]} />
        <Text style={styles.text}>보호소</Text>
      </Pressable>
      {/* <Pressable style={styles.menuWrap} onPress={() => handleRoute('/login')}>
        <Login width={24} height={24} color={theme.colors.black[900]} />
        <Text style={styles.text}>로그인</Text>
      </Pressable> */}
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
