import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Route, TabView, TabViewProps } from 'react-native-tab-view';
import { useTheme } from 'tamagui';

import { theme } from '@/shared/constants';

interface CustomTabBarProps {
  navigationState: any;
  onIndexChange: (index: number) => void;
  activeColor: string;
  inactiveColor: string;
}

const CustomTabBar = ({ navigationState, onIndexChange, activeColor, inactiveColor }: CustomTabBarProps) => {
  const activeIndex = navigationState.index;
  const routes = navigationState.routes;
  const animatedIndex = useSharedValue(activeIndex);

  useEffect(() => {
    animatedIndex.value = withTiming(activeIndex, {
      duration: 250
    });
  }, [activeIndex, animatedIndex]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const leftPosition = interpolate(
      animatedIndex.value,
      routes.map((_, index) => index),
      routes.map((_, index) => (100 / routes.length) * index + (100 / routes.length - (100 / routes.length) * 0.6) / 2)
    );

    return {
      left: `${leftPosition}%`,
      width: `${(100 / routes.length) * 0.6}%`
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer}>
        {routes.map((route: any, index: number) => {
          const isActive = index === activeIndex;

          return (
            <Pressable
              key={route.key}
              style={styles.tabItem}
              onPress={() => onIndexChange(index)}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            >
              <Text style={[styles.label, { color: isActive ? activeColor : inactiveColor }]}>{route.title}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* 커스텀 인디케이터 - Reanimated 적용 */}
      <View style={styles.indicatorContainer}>
        <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      </View>
    </View>
  );
};

export const Tab = <T extends Route>(props: TabViewProps<T>) => {
  const { black900, black500 } = useTheme();
  const width = Dimensions.get('screen').width;

  return (
    <TabView
      initialLayout={{ width }}
      swipeEnabled={true} // 스와이프 활성화
      renderTabBar={(tabBarProps) => (
        <CustomTabBar
          navigationState={tabBarProps.navigationState}
          onIndexChange={props.onIndexChange}
          activeColor={black900.val}
          inactiveColor={black500.val}
        />
      )}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.background.default,
    height: 55,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.white[600],
    position: 'relative'
  },
  tabContainer: {
    flexDirection: 'row',
    height: '100%'
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 3
  },
  indicator: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: 10,
    height: 3,
    position: 'absolute'
  },
  label: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'center'
  }
});
