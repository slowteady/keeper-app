import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { NavigationState, Route, TabView, TabViewProps } from 'react-native-tab-view';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

const WIDTH = Dimensions.get('screen').width;

export type TabBarVariant = 'fill' | 'text';

export const Tab = <T extends Route>({
  tabBarVariant = 'fill',
  swipeEnabled = true,
  ...props
}: TabViewProps<T> & { tabBarVariant?: TabBarVariant }) => {
  const { black900, black500, black400 } = useTheme();

  return (
    <TabView
      initialLayout={{ width: WIDTH }}
      swipeEnabled={swipeEnabled}
      lazy={true}
      renderTabBar={(tabBarProps) =>
        tabBarVariant === 'text' ? (
          <TextTabBar
            navigationState={tabBarProps.navigationState}
            onIndexChange={props.onIndexChange}
            activeColor={black900.val}
            inactiveColor={black400.val}
          />
        ) : (
          <FillTabBar
            navigationState={tabBarProps.navigationState}
            onIndexChange={props.onIndexChange}
            activeColor={black900.val}
            inactiveColor={black500.val}
          />
        )
      }
      {...props}
    />
  );
};

type TabBarProps<T extends Route> = {
  navigationState: NavigationState<T>;
  onIndexChange: (index: number) => void;
  activeColor: string;
  inactiveColor: string;
};

// 29cm식 좌측 정렬 텍스트 탭 — 활성 라벨 하단 언더라인
const TextTabBar = <T extends Route>({
  navigationState,
  onIndexChange,
  activeColor,
  inactiveColor
}: TabBarProps<T>) => {
  const activeIndex = navigationState.index;

  return (
    <TextTabContainer>
      {navigationState.routes.map((route, idx) => {
        const isActive = idx === activeIndex;
        return (
          <TextTabItem
            key={`${route.key}-${idx}`}
            onPress={() => onIndexChange(idx)}
            hitSlop={12}
            style={{ borderBottomColor: isActive ? activeColor : 'transparent' }}
          >
            <TextTabLabel style={{ color: isActive ? activeColor : inactiveColor }}>{route.title}</TextTabLabel>
          </TextTabItem>
        );
      })}
    </TextTabContainer>
  );
};

const TAB_BAR_HEIGHT = 55;
const TAB_BAR_INDICATOR_HEIGHT = 3;

const FillTabBar = <T extends Route>({
  navigationState,
  onIndexChange,
  activeColor,
  inactiveColor
}: TabBarProps<T>) => {
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
      routes.map((_, index) => (100 / routes.length) * index)
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

      <Underline />

      <IndicatorContainer>
        <Animated.View style={[styles.indicator, animatedIndicatorStyle, { backgroundColor: black900.val }]} />
      </IndicatorContainer>
    </Container>
  );
};

const Container = styled(View, {
  position: 'relative',
  height: TAB_BAR_HEIGHT + TAB_BAR_INDICATOR_HEIGHT
});

const TabContainer = styled(XStack, {
  items: 'center',
  height: TAB_BAR_HEIGHT
});

const StyledText = styled(Text, {
  fontSize: 17,
  lineHeight: 19,
  fontWeight: '600',
  text: 'center'
});

const Underline = styled(View, {
  position: 'absolute',
  t: TAB_BAR_HEIGHT - 1,
  l: 0,
  r: 0,
  height: 1,
  bg: '$white600'
});

const IndicatorContainer = styled(View, {
  position: 'absolute',
  b: 0,
  l: 0,
  r: 0,
  height: TAB_BAR_INDICATOR_HEIGHT
});

const TextTabContainer = styled(XStack, {
  items: 'flex-end',
  gap: 24,
  px: 20,
  mb: 12,
  borderBottomWidth: 1,
  borderColor: '$white600'
});

const TextTabItem = styled(View, {
  pb: 8,
  mb: -1,
  borderBottomWidth: 2.5
});

const TextTabLabel = styled(Text, {
  fontSize: 20,
  lineHeight: 26,
  fontWeight: '700'
});

const styles = StyleSheet.create({
  indicator: {
    height: TAB_BAR_INDICATOR_HEIGHT,
    position: 'absolute'
  }
});
