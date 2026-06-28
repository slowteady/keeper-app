import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';

import { useHasUnreadNotices } from '@/features/notice';
import { BottomNavigation } from '@/shared/ui';

const NoticeAwareTabBar = (props: BottomTabBarProps) => {
  const { hasUnread } = useHasUnreadNotices();
  return <BottomNavigation {...props} dotRoutes={hasUnread ? ['profile'] : []} />;
};

const TabsLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <NoticeAwareTabBar {...props} />}
      detachInactiveScreens={false}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="adopt" />
      <Tabs.Screen name="shelter" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default TabsLayout;
