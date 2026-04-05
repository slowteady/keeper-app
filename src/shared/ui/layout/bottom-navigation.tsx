import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationRoute, ParamListBase } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ComponentType, memo } from 'react';
import { SvgProps } from 'react-native-svg';
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
  Message,
  User
} from '@/shared/ui/icons/outline';

type MenuItem = {
  name: string;
  label: string;
  Icon: ComponentType<SvgProps>;
  ActiveIcon: ComponentType<SvgProps>;
  size: number;
};

const MENU_ITEMS: MenuItem[] = [
  { name: 'home', label: 'Home', Icon: Home2, ActiveIcon: ActiveHome2, size: 24 },
  { name: 'adopt', label: '입양공고', Icon: Heart, ActiveIcon: ActiveHeart, size: 26 },
  { name: 'shelter', label: '보호소', Icon: Location, ActiveIcon: ActiveLocation, size: 28 },
  { name: 'community', label: '커뮤니티', Icon: Message, ActiveIcon: ActiveMessage, size: 24 },
  { name: 'profile', label: '프로필', Icon: User, ActiveIcon: ActiveUser, size: 26 }
];

const TabIcon = ({ item, isActive }: { item: MenuItem; isActive: boolean }) => {
  const { Icon, ActiveIcon, size } = item;
  return isActive ? <ActiveIcon width={size} height={size} /> : <Icon width={size} height={size} color="#0C0C0C" />;
};

export const BottomNavigation = memo(({ state, navigation, insets }: BottomTabBarProps) => {
  const navigateToPage = (route: NavigationRoute<ParamListBase, string>, index: number) => {
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
                  <TabIcon item={item} isActive={isActive} />
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

BottomNavigation.displayName = 'BottomNavigation';

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
