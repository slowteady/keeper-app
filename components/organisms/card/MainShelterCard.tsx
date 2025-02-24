import { AnimatedHeartIcon } from '@/components/atoms/icons/HeartIcon';
import theme from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { interpolateColor, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

interface MainShelterCardProps {
  onPressLike: () => void;
  name: string;
  address: string;
  tel: string;
}

const MainShelterCard = ({ onPressLike, name, address, tel }: MainShelterCardProps) => {
  const fill = useSharedValue(0);

  const handlePressHeart = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fill.value = withTiming(fill.value === 0 ? 1 : 0, { duration: 300 });
    onPressLike();
  }, [fill, onPressLike]);

  const animatedProps = useAnimatedProps(() => {
    const fillColor = interpolateColor(fill.value, [0, 1], ['transparent', theme.colors.primary.main]);
    const strokeColor = interpolateColor(fill.value, [0, 1], [theme.colors.black[600], theme.colors.primary.main]);

    return { fill: fillColor, stroke: strokeColor };
  });

  const descriptions = [
    { label: '주소', value: address },
    { label: '전화', value: tel }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title} ellipsizeMode="tail" numberOfLines={1}>
          {name}
        </Text>
        <TouchableOpacity onPress={handlePressHeart} activeOpacity={0.5}>
          <AnimatedHeartIcon animatedProps={animatedProps} />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <View style={styles.descriptionWrap}>
        {descriptions.map(({ label, value }, idx) => {
          const key = `${label}-${idx}`;
          return (
            <View key={key} style={styles.descriptionRow}>
              <Text style={styles.description}>{label}</Text>
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={[styles.description, { color: theme.colors.black[900], flex: 1 }]}
              >
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default MainShelterCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    backgroundColor: theme.colors.white[900],
    paddingVertical: 18,
    width: 270
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    flex: 1,
    color: theme.colors.black[900],
    ...theme.fonts.medium
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.white[800],
    marginVertical: 16
  },
  descriptionWrap: {
    paddingVertical: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  descriptionRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20
  },
  description: {
    fontSize: 12,
    color: theme.colors.black[600],
    lineHeight: 14,
    fontWeight: '400'
  }
});
