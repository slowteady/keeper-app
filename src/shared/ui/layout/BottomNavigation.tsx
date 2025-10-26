import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { styled, Text, useTheme, View } from 'tamagui';

export interface BottomNavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  route: string;
}

export interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  items: BottomNavigationItem[];
}

const Container = styled(View, {
  flexDirection: 'row',
  bg: '$white900',
  px: 16,
  py: 12,
  pb: 34,
  justify: 'space-around',
  items: 'center',
  borderTopWidth: 1,
  borderTopColor: '$black4',
  position: 'relative'
});

const TabItem = styled(Pressable, {
  flex: 1,
  items: 'center',
  py: 8,
  position: 'relative',
  justify: 'center'
});

const TabIcon = styled(View, {
  mb: 4,
  items: 'center',
  justify: 'center'
});

const TabLabel = styled(Text, {
  fontSize: 12,
  fontWeight: '400',
  color: '$black900',
  text: 'center'
});

const ActiveTabLabel = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  color: '$black900',
  text: 'center'
});

const TabItemIndicator = styled(View, {
  position: 'absolute',
  b: 0,
  height: 3,
  bg: '$primaryMain',
  rounded: 2,
  width: 20,
  items: 'center'
});

const Indicator = styled(Animated.View, {
  position: 'absolute',
  b: 34,
  height: 4,
  bg: '$primaryMain',
  rounded: 2,
  width: 20,
  z: 10
});

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabPress, items }) => {
  const theme = useTheme();
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(20);

  const getActiveIndex = () => {
    return items.findIndex((item) => item.id === activeTab);
  };

  const activeIndex = getActiveIndex();

  React.useEffect(() => {
    if (activeIndex >= 0) {
      indicatorPosition.value = withSpring(activeIndex, {
        damping: 20,
        stiffness: 200,
        mass: 0.8
      });
    }
  }, [activeIndex, indicatorPosition]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = 100 / items.length;
    const translateX = interpolate(
      indicatorPosition.value,
      [0, items.length - 1],
      [0, (items.length - 1) * tabWidth],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: `${translateX + tabWidth / 2 - 10}%` }],
      width: indicatorWidth.value
    };
  });

  const renderIcon = (IconComponent: React.ComponentType<any>, isActive: boolean) => {
    const iconProps = {
      width: 24,
      height: 24,
      color: theme.black900.val,
      stroke: theme.black900.val,
      strokeWidth: 1.5,
      fill: isActive ? theme.black900.val : 'none'
    };

    return <IconComponent {...iconProps} />;
  };

  return (
    <Container>
      {items.map((item, index) => {
        const isActive = item.id === activeTab;
        const IconComponent = item.icon;

        return (
          <TabItem
            key={item.id}
            onPress={() => onTabPress(item.id)}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1
              }
            ]}
          >
            <TabIcon>{renderIcon(IconComponent, isActive)}</TabIcon>
            {isActive ? <ActiveTabLabel>{item.label}</ActiveTabLabel> : <TabLabel>{item.label}</TabLabel>}
            {isActive && <TabItemIndicator />}
          </TabItem>
        );
      })}
    </Container>
  );
};

export default BottomNavigation;
