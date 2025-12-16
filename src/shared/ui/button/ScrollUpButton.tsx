import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ScrollButton } from '@/shared/ui/icons/etc';

import { Button } from './Button';

export interface ScrollUpButtonProps {
  visible: boolean;
  onPress: () => void;
  bottom?: number;
}

export const ScrollUpButton = ({ onPress, visible, bottom = 20 }: ScrollUpButtonProps) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(visible ? 1 : 0, { duration: 300 });
  }, [scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value
  }));

  return (
    <Animated.View style={[styles.button, animatedStyle, { bottom }]}>
      <Button variant="ghost" onPress={onPress}>
        <ScrollButton width={64} height={64} />
      </Button>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    position: 'absolute',
    right: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3
      },
      android: {
        elevation: 4
      }
    })
  }
});
