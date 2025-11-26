import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { styled, Text, XStack, YStack } from 'tamagui';

import { MENU_ITEMS } from '@/shared/model';
import {
  ActiveHeart,
  ActiveHome2,
  ActiveLocation,
  ActiveMessage,
  ActiveUser,
  Heart,
  Home2,
  Location,
  Message,
  User
} from '@/shared/ui/icons/outline';

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

  const renderIcon = (name: string, isActive: boolean) => {
    const IconComponent = iconMap[name as keyof typeof iconMap];
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

  return isActive ? <ActiveHome2 {...size} /> : <Home2 {...size} />;
});

const AnimatedHeartIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 26, height: 26 } as const;

  return isActive ? <ActiveHeart {...size} /> : <Heart {...size} />;
});

const AnimatedLocationIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 28, height: 28 } as const;

  return isActive ? <ActiveLocation {...size} /> : <Location {...size} />;
});

const AnimatedMessageIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 24, height: 24 } as const;

  return isActive ? <ActiveMessage {...size} /> : <Message {...size} />;
});

const AnimatedUserIcon = memo(({ isActive }: { isActive: boolean }) => {
  const size = { width: 26, height: 26 } as const;

  return isActive ? <ActiveUser {...size} /> : <User {...size} />;
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
  fontWeight: '600'
});

BottomNavigation.displayName = 'CustomTabBar';
AnimatedHomeIcon.displayName = 'AnimatedHomeIcon';
AnimatedHeartIcon.displayName = 'AnimatedHeartIcon';
AnimatedLocationIcon.displayName = 'AnimatedLocationIcon';
AnimatedMessageIcon.displayName = 'AnimatedMessageIcon';
AnimatedUserIcon.displayName = 'AnimatedUserIcon';
