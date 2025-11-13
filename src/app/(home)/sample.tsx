import { router, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { styled } from 'tamagui';

import { Heart, Home2, MapPin, Message, User } from '@/shared/ui/icons/outline';
import { BottomNavigationProvider, useBottomNavigation } from '@/shared/ui/layout';
import BottomNavigation from '@/shared/ui/layout/BottomNavigation';

const Container = styled(View, {
  flex: 1,
  background: '$white'
});

const ContentContainer = styled(View, {
  flex: 1
});

const BottomNavigationItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home2,
    route: '/(home)'
  },
  {
    id: 'adopt',
    label: '입양공고',
    icon: Heart,
    route: '/(home)/(public)/adopt'
  },
  {
    id: 'location',
    label: '내위치',
    icon: MapPin,
    route: '/(home)/(public)/shelter'
  },
  {
    id: 'community',
    label: '커뮤니티',
    icon: Message,
    route: '/(home)/(public)/community'
  },
  {
    id: 'profile',
    label: '프로필',
    icon: User,
    route: '/(home)/(public)/profile'
  }
];

const BottomNavigationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, setItems } = useBottomNavigation();
  const pathname = usePathname();

  useEffect(() => {
    setItems(BottomNavigationItems);
  }, [setItems]);

  useEffect(() => {
    // 현재 경로에 따라 활성 탭 설정
    const currentItem = BottomNavigationItems.find((item) => pathname.startsWith(item.route));

    if (currentItem && currentItem.id !== activeTab) {
      setActiveTab(currentItem.id);
    }
  }, [pathname, activeTab, setActiveTab]);

  const handleTabPress = (tabId: string) => {
    const item = BottomNavigationItems.find((item) => item.id === tabId);
    if (item) {
      setActiveTab(tabId);
      router.push(item.route as any);
    }
  };

  return (
    <Container>
      <ContentContainer>{children}</ContentContainer>
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} items={BottomNavigationItems} />
    </Container>
  );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BottomNavigationProvider initialTab="home">
      <BottomNavigationLayout>{children}</BottomNavigationLayout>
    </BottomNavigationProvider>
  );
};

export default MainLayout;
