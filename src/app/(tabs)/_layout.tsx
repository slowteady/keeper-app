import { Tabs } from 'expo-router';

import { BottomNavigation } from '@/entities';

const TabsLayout = () => {
  return (
    <Tabs tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="adopt" />
      <Tabs.Screen name="shelter" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default TabsLayout;
