import theme from '@/constants/theme';
import { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface BasicTabProps<T extends { label: string }> {
  category: T[];
  value: T;
  onChange: (value: T) => void;
}

const BasicTab = <T extends { label: string }>({ category, value, onChange }: BasicTabProps<T>) => {
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const tabWidth = useMemo(() => tabContainerWidth / category.length, [category.length, tabContainerWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabContainerWidth(width);
  };

  const handlePress = useCallback(
    (value: T, index: number) => {
      onChange(value);
      translateX.value = withTiming(tabWidth * index, { duration: 300 });
    },
    [onChange, tabWidth, translateX]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={[styles.tabContainer, { width: tabContainerWidth }]}>
        {category.map((tab, index) => {
          const key = `${tab.label}-${index}`;
          const isActive = value.label === tab.label;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handlePress(tab, index)}
            >
              <TabText isActive={isActive} value={tab.label} />
            </TouchableOpacity>
          );
        })}
        <Animated.View style={[styles.underline, animatedStyle, { width: tabWidth }]} />
      </View>
    </View>
  );
};

export default BasicTab;

interface TabTextProps {
  isActive: boolean;
  value: string;
}
const TabText = ({ isActive, value }: TabTextProps) => {
  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(isActive ? 1 : 0, [0, 1], [theme.colors.black[600], theme.colors.black[900]]);
    return { color };
  });

  return <Animated.Text style={[styles.text, animatedTextStyle]}>{value}</Animated.Text>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent'
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    borderBottomWidth: theme.hairline
  },
  tab: {
    paddingVertical: 12
  },
  text: {
    color: theme.colors.black[900],
    textAlign: 'center'
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: theme.colors.primary.main
  }
});
