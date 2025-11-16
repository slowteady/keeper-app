import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { styled, Text, XStack, YStack } from 'tamagui';

import { MENU_ITEMS } from '@/shared/model';

import { Indicator } from '../icons/outline';

const INDICATOR_WIDTH = 70;

export const CustomTabBar = memo(({ state, navigation, insets }: BottomTabBarProps) => {
  const indicatorIndex = useSharedValue(state.index);
  const tabWidth = useSharedValue(0);

  useEffect(() => {
    indicatorIndex.value = withSpring(state.index, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
      overshootClamping: true
    });
  }, [state.index, indicatorIndex]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    if (tabWidth.value === 0) {
      return {};
    }

    const centerX = (indicatorIndex.value + 0.5) * tabWidth.value;
    const x = centerX - INDICATOR_WIDTH / 2;

    return {
      transform: [{ translateX: x }]
    };
  });

  const calculateLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      tabWidth.value = width / MENU_ITEMS.length;
    },
    [tabWidth]
  );

  const navigateToPage = (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true
    });

    if (!event.defaultPrevented && state.index !== index) {
      Haptics.selectionAsync();
      indicatorIndex.value = withSpring(index, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
        overshootClamping: true
      });

      navigation.navigate(route.name);
    }
  };

  return (
    <Container pb={insets.bottom}>
      <TabItemWrapper onLayout={calculateLayout}>
        <XStack>
          {MENU_ITEMS.map((item, index) => {
            const route = state.routes[index];
            const isActive = state.index === index;

            return (
              <TabItemContainer key={route.key} onPress={() => navigateToPage(route, index)}>
                <TabItemInner>
                  <item.icon width={24} height={24} />
                  <TabLabel>{item.label}</TabLabel>
                </TabItemInner>
              </TabItemContainer>
            );
          })}
        </XStack>

        <Animated.View
          style={[{ position: 'absolute', bottom: 0, left: 0, width: INDICATOR_WIDTH }, animatedIndicatorStyle]}
        >
          <Indicator width={INDICATOR_WIDTH} height={20} />
        </Animated.View>
      </TabItemWrapper>
    </Container>
  );
});

const Container = styled(XStack, {
  bg: '$white900'
});

const TabItemWrapper = styled(YStack, {
  flex: 1,
  py: 12,
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

CustomTabBar.displayName = 'CustomTabBar';
