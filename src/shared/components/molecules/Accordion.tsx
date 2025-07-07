import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

export interface AccordionProps extends ViewProps {
  children: React.ReactNode;
  expanded: SharedValue<boolean>;
}
export const Accordion = ({ children, expanded, style, ...props }: AccordionProps) => {
  const height = useSharedValue(0);
  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(expanded.value), {
      duration: 300
    })
  );

  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value
  }));

  return (
    <Animated.View style={[styles.animatedView, bodyStyle, style]} {...props}>
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={styles.wrapper}
      >
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'absolute',
    display: 'flex'
  },
  animatedView: {
    width: '100%',
    overflow: 'hidden'
  }
});
