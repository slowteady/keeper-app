import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { styled, Text, XStack, YStack } from 'tamagui';

import {
  ActiveHeart,
  ActiveHome2,
  ActiveLocation,
  ActiveMessage,
  ActiveUser,
  Heart,
  Home2,
  Location,
  MapPin,
  Message,
  User
} from '@/shared/ui/icons/outline';

const MENU_ITEMS = [
  { name: 'home', label: 'Home', icon: Home2 },
  { name: 'adopt', label: '입양공고', icon: Heart },
  { name: 'shelter', label: '보호소', icon: MapPin },
  { name: 'community', label: '커뮤니티', icon: Message },
  { name: 'profile', label: '프로필', icon: User }
] as const;

export const BottomNavigation = memo(({ state, navigation, insets }: BottomTabBarProps) => {
  const navigateToPage = (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true
    });

    if (!event.defaultPrevented && state.index !== index) {
      Haptics.selectionAsync();
      navigation.navigate(route.name);
    }
  };

  const iconMap = {
    home: AnimatedHomeIcon,
    adopt: AnimatedHeartIcon,
    shelter: AnimatedLocationIcon,
    community: AnimatedMessageIcon,
    profile: AnimatedUserIcon
  } as const;

  const renderIcon = (name: keyof typeof iconMap, isActive: boolean) => {
    const IconComponent = iconMap[name];
    return IconComponent ? <IconComponent isActive={isActive} /> : null;
  };

  return (
    <Container pb={insets.bottom}>
      <TabItemWrapper>
        <XStack>
          {MENU_ITEMS.map((item, index) => {
            const route = state.routes[index];
            const isActive = state.index === index;

            return (
              <TabItemContainer key={route.key} onPress={() => navigateToPage(route, index)}>
                <TabItemInner>
                  {renderIcon(item.name, isActive)}
                  <TabLabel>{item.label}</TabLabel>
                </TabItemInner>
              </TabItemContainer>
            );
          })}
        </XStack>
      </TabItemWrapper>
    </Container>
  );
});

const AnimatedHomeIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 24, height: 24 } as const;

  return isActive ? <ActiveHome2 {...size} /> : <Home2 {...size} color="#0C0C0C" />;
});

const AnimatedHeartIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 26, height: 26 } as const;

  return isActive ? <ActiveHeart {...size} /> : <Heart {...size} color="#0C0C0C" />;
});

const AnimatedLocationIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 28, height: 28 } as const;

  return isActive ? <ActiveLocation {...size} /> : <Location {...size} color="#0C0C0C" />;
});

const AnimatedMessageIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 24, height: 24 } as const;

  return isActive ? <ActiveMessage {...size} /> : <Message {...size} color="#0C0C0C" />;
});

const AnimatedUserIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 26, height: 26 } as const;

  return isActive ? <ActiveUser {...size} /> : <User {...size} color="#0C0C0C" />;
});

const Container = styled(XStack, {
  bg: '$white900'
});

const TabItemWrapper = styled(YStack, {
  flex: 1,
  pt: 12,
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderColor: '#E9E9E9',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  position: 'relative'
});

const TabItemContainer = styled(YStack, {
  flex: 1,
  items: 'center',
  justify: 'center',
  pressStyle: { scale: 0.95 }
});

const TabItemInner = styled(YStack, {
  items: 'center',
  justify: 'center',
  gap: 4,
  pointerEvents: 'none'
});

const TabLabel = styled(Text, {
  fontSize: 11,
  lineHeight: 13,
  fontWeight: '600',
  color: '#0C0C0C'
});

BottomNavigation.displayName = 'CustomTabBar';
AnimatedHomeIcon.displayName = 'AnimatedHomeIcon';
AnimatedHeartIcon.displayName = 'AnimatedHeartIcon';
AnimatedLocationIcon.displayName = 'AnimatedLocationIcon';
AnimatedMessageIcon.displayName = 'AnimatedMessageIcon';
AnimatedUserIcon.displayName = 'AnimatedUserIcon';
