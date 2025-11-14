import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

import { MENU_ITEMS } from '@/shared/model';

import { Indicator } from '../icons/outline';

export const CustomTabBar = ({ state, navigation, insets }: BottomTabBarProps) => {
  const theme = useTheme();
  const indicatorPosition = useSharedValue(state.index);

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index, {
      damping: 20,
      stiffness: 200,
      mass: 0.8
    });
  }, [state.index, indicatorPosition]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = 100 / MENU_ITEMS.length;

    const tabCenters = MENU_ITEMS.map((_, index) => {
      return index * tabWidth;
    });

    const centerPosition = interpolate(indicatorPosition.value, [0, 1, 2, 3, 4], tabCenters, 'clamp');

    return {
      transform: [{ translateX: `${centerPosition}%` }]
    };
  });

  const handlePress = async (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true
    });

    if (!event.defaultPrevented && state.index !== index) {
      await Haptics.selectionAsync();
      navigation.navigate(route.name);
    }
  };

  return (
    <Container>
      <TabItemWrapper pb={insets.bottom}>
        <XStack>
          {MENU_ITEMS.map((item, index) => {
            const route = state.routes[index];
            const isActive = state.index === index;

            return (
              <TabItemContainer key={route.key} opacity={isActive ? 1 : 0.5}>
                <TabItemInner onPress={() => handlePress(route, index)}>
                  <item.icon
                    width={24}
                    height={24}
                    color={isActive ? theme.black900.val : theme.gray500?.val}
                    fill={isActive ? theme.black900.val : 'none'}
                  />
                  <TabLabel>{item.label}</TabLabel>
                </TabItemInner>
              </TabItemContainer>
            );
          })}
        </XStack>

        <Animated.View style={[{ bottom: 5 }, animatedIndicatorStyle]}>
          <Indicator width={70} height={20} />
        </Animated.View>
      </TabItemWrapper>
    </Container>
  );
};

const Container = styled(XStack, {
  bg: '$white900'
});

const TabItemWrapper = styled(YStack, {
  flex: 1,
  px: 16,
  py: 12,
  borderWidth: 1,
  borderColor: '#E9E9E9',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16
});

const TabItemContainer = styled(YStack, {
  flex: 1,
  items: 'center',
  justify: 'center'
});

const TabItemInner = styled(YStack, {
  items: 'center',
  justify: 'center',
  gap: 4,
  animation: 'quick',
  pressStyle: {
    scale: 0.9
  }
});

const TabLabel = styled(Text, {
  fontSize: 11,
  lineHeight: 13,
  fontWeight: '600',
  animation: 'quick'
});
