import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ScrollButton } from '../icons/etc';
import Button from './Button';

interface ScrollFloatingButtonProps {
  visible: boolean;
  onPress: () => void;
}

const ScrollFloatingButton = ({ onPress, visible }: ScrollFloatingButtonProps) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(visible ? 1 : 0, { duration: 300 });
  }, [scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value
  }));

  return (
    <Animated.View style={[styles.button, animatedStyle]}>
      <Button onPress={onPress}>
        <ScrollButton width={64} height={64} />
      </Button>
    </Animated.View>
  );
};

export default ScrollFloatingButton;

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    position: 'absolute',
    right: 20,
    bottom: 20,
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
