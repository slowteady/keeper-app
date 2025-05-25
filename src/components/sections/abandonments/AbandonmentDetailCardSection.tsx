import { TransformedAbandonmentDetail } from '@/business/abandonmentsBusiness';
import { Carousel } from '@/components/molecules/carousel/Carousel';
import theme from '@/constants/theme';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

interface AbandonmentDetailCardSectionProps {
  data: TransformedAbandonmentDetail;
}
const AbandonmentDetailCardSection = ({ data }: AbandonmentDetailCardSectionProps) => {
  const { title, images, description } = data;

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Carousel data={images} showIndicator showImageViewer />
      </View>

      {description.map(({ label, value }, idx) => {
        const key = `${label}-${idx}`;
        return (
          <View key={key} style={styles.descriptionContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.text}>{value}</Text>
          </View>
        );
      })}
    </>
  );
};

export default AbandonmentDetailCardSection;

const PADDING_HORIZONTAL = 20;
const styles = StyleSheet.create({
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
    gap: 8
  },
  imageContainer: {
    position: 'relative',
    width: Dimensions.get('screen').width - PADDING_HORIZONTAL * 2,
    aspectRatio: 5 / 4,
    marginBottom: 28
  },
  image: {
    position: 'absolute',
    top: 0,
    borderRadius: 10,
    width: '100%',
    height: '100%'
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '500',
    flex: 1
  },
  descriptionContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  label: {
    flexShrink: 0,
    fontSize: 15,
    color: theme.colors.black[600],
    fontWeight: '400',
    lineHeight: 21,
    minWidth: 70,
    alignSelf: 'flex-start'
  },
  text: {
    flex: 1,
    color: theme.colors.black[900],
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    alignSelf: 'flex-start'
  },
  iconWrap: {
    position: 'absolute',
    right: 16,
    top: 16
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10
  }
});
