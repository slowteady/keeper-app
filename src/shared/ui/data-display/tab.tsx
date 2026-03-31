import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { NavigationState, Route, TabView, TabViewProps } from 'react-native-tab-view';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

const WIDTH = Dimensions.get('screen').width;

export const Tab = <T extends Route>({ ...props }: TabViewProps<T>) => {
  const { black900, black500 } = useTheme();

  return (
    <TabView
      initialLayout={{ width: WIDTH }}
      swipeEnabled={true}
      renderTabBar={(tabBarProps) => (
        <TabItem
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

export type TabItemProps<T extends Route> = {
  navigationState: NavigationState<T>;
  onIndexChange: (index: number) => void;
  activeColor: string;
  inactiveColor: string;
};

export const TAB_BAR_HEIGHT = 55;
export const TAB_BAR_INDICATOR_HEIGHT = 3;

export const TabItem = <T extends Route>({
  navigationState,
  onIndexChange,
  activeColor,
  inactiveColor
}: TabItemProps<T>) => {
  const activeIndex = navigationState.index;
  const routes = navigationState.routes;
  const animatedIndex = useSharedValue(activeIndex);

  const { black900 } = useTheme();

  useEffect(() => {
    animatedIndex.value = withTiming(activeIndex, {
      duration: 100
    });
  }, [activeIndex, animatedIndex]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const leftPosition = interpolate(
      animatedIndex.value,
      routes.map((_, index) => index),
      routes.map((_, index) => (100 / routes.length) * index + (100 / routes.length - 100 / routes.length))
    );

    return {
      left: `${leftPosition}%`,
      width: `${100 / routes.length}%`
    };
  });

  return (
    <Container>
      <TabContainer>
        {routes.map((route, idx) => {
          const isActive = idx === activeIndex;
          const key = `${route.key}-${idx}`;

          return (
            <View key={key} onPress={() => onIndexChange(idx)} flex={1} items="center" justify="center" hitSlop={16}>
              <StyledText style={{ color: isActive ? activeColor : inactiveColor }}>{route.title}</StyledText>
            </View>
          );
        })}
      </TabContainer>

      <IndicatorContainer>
        <Animated.View style={[styles.indicator, animatedIndicatorStyle, { backgroundColor: black900.val }]} />
      </IndicatorContainer>
    </Container>
  );
};

const Container = styled(View, {
  position: 'relative',
  borderBottomWidth: 1,
  borderBottomColor: '$white600',
  height: TAB_BAR_HEIGHT
});

const TabContainer = styled(XStack, {
  items: 'center',
  height: '100%'
});

const StyledText = styled(Text, {
  fontSize: 17,
  lineHeight: 19,
  fontWeight: '600',
  text: 'center'
});

const IndicatorContainer = styled(View, {
  position: 'absolute',
  b: -3,
  l: 0,
  r: 0,
  height: TAB_BAR_INDICATOR_HEIGHT
});

const styles = StyleSheet.create({
  indicator: {
    borderRadius: 10,
    height: 3,
    position: 'absolute'
  }
});
