import { TransformedAbandonmentData } from '@/businesses/abandonmentsBusiness';
import { AnimatedHeartIcon } from '@/components/atoms/icons/HeartIcon';
import MoreIcon from '@/components/atoms/icons/MoreIcon';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import { BasicCard } from '@/components/organisms/card/BasicCard';
import theme from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { interpolateColor, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

interface AbandonmentDetailCardSectionProps {
  data: TransformedAbandonmentData;
}
const PADDING_HORIZONTAL = 20;
const imgWidth = Dimensions.get('screen').width - PADDING_HORIZONTAL * 2;
const imgHeight = imgWidth * 0.8;
const AbandonmentDetailCardSection = ({ data }: AbandonmentDetailCardSectionProps) => {
  const fill = useSharedValue(0);

  const handlePressHeart = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fill.value = withTiming(fill.value === 0 ? 1 : 0, { duration: 300 });
  }, [fill]);

  const handlePressMore = useCallback(() => {
    //
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const fillColor = interpolateColor(fill.value, [0, 1], ['transparent', theme.colors.primary.main]);
    const strokeColor = interpolateColor(fill.value, [0, 1], [theme.colors.black[600], theme.colors.primary.main]);

    return { fill: fillColor, stroke: strokeColor };
  });

  const { title, uri, chips, description } = data;

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        <View style={styles.iconWrap}>
          <TouchableOpacity onPress={handlePressHeart} activeOpacity={0.5}>
            <AnimatedHeartIcon animatedProps={animatedProps} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePressMore} activeOpacity={0.5}>
            <MoreIcon />
          </TouchableOpacity>
        </View>
      </View>

      <Card uri={uri} chips={chips} description={description} />
    </View>
  );
};

export default AbandonmentDetailCardSection;

interface CardProps {
  uri: string;
  chips: TransformedAbandonmentData['chips'];
  description: TransformedAbandonmentData['description'];
}
const Card = ({ uri, chips, description }: CardProps) => {
  const [isLoad, setIsLoad] = useState(false);

  const sortedChips = chips
    .map(({ chipStyle, containerStyle, ...rest }) => {
      return {
        chipStyle: { ...styles.chipText, ...chipStyle },
        containerStyle: { ...styles.chipsContainer, ...containerStyle },
        ...rest
      };
    })
    .sort((a, b) => a.sort - b.sort);

  return (
    <View style={{ width: imgWidth }}>
      <View style={{ width: imgWidth, height: imgHeight, marginBottom: 20 }}>
        {!isLoad && <Skeleton />}
        {uri ? <BasicCard.Image source={{ uri }} onLoad={() => setIsLoad(true)} /> : <BasicCard.NoImage />}
      </View>
      <BasicCard.Chips data={sortedChips} />
      <BasicCard.Descriptions data={description} primaryStyle={{ minWidth: 65 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 24
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 32,
    gap: 8,
    marginBottom: 20
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 26,
    fontWeight: '500',
    flex: 1
  },
  iconWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  chipsContainer: {
    alignSelf: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 3
  },
  chipText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14
  }
});
