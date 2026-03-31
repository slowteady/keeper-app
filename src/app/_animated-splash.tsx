import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface AnimatedSplashProps {
  onFinish: () => void;
}

const AnimatedSplash = ({ onFinish }: AnimatedSplashProps) => {
  const containerOpacity = useSharedValue(1);
  const logoMarginTop = useSharedValue(0);
  const puppyTop = useSharedValue(-140);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    marginTop: logoMarginTop.value
  }));

  const animatedPuppyStyle = useAnimatedStyle(() => ({
    top: puppyTop.value
  }));

  useEffect(() => {
    logoMarginTop.value = withTiming(44, { duration: 300 });
    puppyTop.value = withTiming(-100, { duration: 300 });

    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [containerOpacity, logoMarginTop, onFinish, puppyTop]);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.wrapper}>
        <Animated.View style={[styles.puppyWrapper, animatedPuppyStyle]}>
          <LottieView source={require('@/assets/animations/puppy.json')} autoPlay style={styles.puppy} />
        </Animated.View>

        <Animated.View style={animatedLogoStyle}>
          <Image source={require('@/assets/images/keeper-logo.png')} contentFit="contain" style={styles.logo} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default AnimatedSplash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1FE678',
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapper: {
    position: 'relative'
  },
  puppyWrapper: {
    position: 'absolute',
    left: -10
  },
  puppy: {
    width: 200,
    height: 200
  },
  logo: {
    width: 180,
    height: 100
  }
});
