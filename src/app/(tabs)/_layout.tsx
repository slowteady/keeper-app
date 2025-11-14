import { Tabs } from 'expo-router';

import { useAuth } from '@/domains/auth';
import { CustomTabBar } from '@/shared';

const TabsLayout = () => {
  useAuth();

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="adopt" options={{ title: '입양공고' }} />
      <Tabs.Screen name="shelter" options={{ title: '내위치' }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티' }} />
      <Tabs.Screen name="profile" options={{ title: '프로필' }} />
    </Tabs>
  );
};

export default TabsLayout;
