import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { AnimatedMenuHeartIcon } from '@/components/atoms/icons/HeartIcon';
import { Accordion } from '@/components/molecules/transition/Accordion';
import { ADOPT_SUB_MENU } from '@/constants/menu';
import theme from '@/constants/theme';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

const AdoptMenuSection = () => {
  const open = useSharedValue(false);
  const rotate = useSharedValue(0);
  const fill = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }]
  }));

  const animatedProps = useAnimatedProps(() => {
    const fillColor = interpolateColor(fill.value, [0, 1], ['transparent', theme.colors.primary.main]);
    return { fill: fillColor };
  });

  const handleExpand = useCallback(() => {
    open.value = !open.value;
    rotate.value = withTiming(rotate.value === 0 ? -90 : 0, { duration: 300 });
    fill.value = withTiming(fill.value === 0 ? 1 : 0, { duration: 300 });
  }, [open, rotate, fill]);

  const menuData = useMemo(
    () =>
      ADOPT_SUB_MENU.map(({ id, ...rest }) => {
        switch (id) {
          case 'ALL': {
            return {
              id,
              ...rest,
              handlePress: () => router.replace('/abandonments')
            };
          }
          case 'NEAR_DEADLINE': {
            return {
              id,
              ...rest,
              handlePress: () => router.replace({ pathname: '/abandonments', params: { filter: 'NEAR_DEADLINE' } })
            };
          }
          case 'NEW': {
            return {
              id,
              ...rest,
              handlePress: () => router.replace({ pathname: '/abandonments', params: { filter: 'NEW' } })
            };
          }
        }
      }),
    []
  );

  return (
    <View style={{ position: 'relative' }}>
      <Pressable onPress={handleExpand}>
        <View style={styles.box}>
          <AnimatedMenuHeartIcon animatedProps={animatedProps} />
          <Text style={[styles.text]}>입양공고</Text>
          <Animated.View style={animatedStyle}>
            <NavArrowIcon />
          </Animated.View>
        </View>
      </Pressable>

      <Accordion expanded={open}>
        <View style={styles.moreMenuBox}>
          {menuData.map(({ id, label, handlePress }, idx) => {
            const key = `${id}-${idx}`;

            return (
              <Pressable key={key + idx} onPress={handlePress} style={{ paddingLeft: 20 }}>
                <Text style={styles.subMenuText}>{label}</Text>
              </Pressable>
            );
          })}
          <View style={styles.divider} />
        </View>
      </Accordion>
    </View>
  );
};

export default AdoptMenuSection;

const styles = StyleSheet.create({
  box: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20
  },
  text: {
    color: theme.colors.black[800],
    fontSize: 17,
    fontWeight: 500,
    flex: 1,
    paddingLeft: 24
  },
  moreMenuBox: {
    paddingTop: 24,
    gap: 20
  },
  divider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.white[600]
  },
  subMenuText: {
    fontSize: 15,
    color: theme.colors.black[700],
    fontWeight: '500',
    paddingLeft: 48
  }
});
