import { TransformedAbandonmentDetail } from '@/businesses/abandonmentsBusiness';
import { MoreImageIcon } from '@/components/atoms/icons/MoreImageIcon';
import NoImage from '@/components/molecules/placeholder/NoImage';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import ImageViewer from '@/components/molecules/viewer/ImageViewer';
import theme from '@/constants/theme';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AbandonmentDetailCardSectionProps {
  data: TransformedAbandonmentDetail;
}
const AbandonmentDetailCardSection = ({ data }: AbandonmentDetailCardSectionProps) => {
  const [isLoad, setIsLoad] = useState(false);
  const [openImgViewer, setOpenImgViewer] = useState(false);
  const { title, uri, description } = data;

  const handlePressImage = () => {
    setOpenImgViewer((prev) => !prev);
  };

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {!isLoad && <Skeleton style={styles.image} />}
        {uri ? (
          <>
            <Image source={{ uri }} onLoad={() => setIsLoad(true)} style={styles.image} contentFit="cover" />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.iconWrap}
              onPress={handlePressImage}
              disabled={!isLoad || !uri}
            >
              <MoreImageIcon color={theme.colors.black[900]} />
            </TouchableOpacity>
          </>
        ) : (
          <NoImage style={{ backgroundColor: theme.colors.white[800] }} />
        )}
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

      <ImageViewer open={openImgViewer} onClose={() => setOpenImgViewer((prev) => !prev)} image={uri} />
    </>
  );
};

export default AbandonmentDetailCardSection;

const PADDING_HORIZONTAL = 20;
const imgWidth = Dimensions.get('screen').width - PADDING_HORIZONTAL * 2;
const imgHeight = imgWidth * 0.8;
const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: imgWidth,
    height: imgHeight,
    marginBottom: 24
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    gap: 8
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
    fontSize: 26,
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
    lineHeight: 17,
    minWidth: 70
  },
  text: {
    flex: 1,
    color: theme.colors.black[900],
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 17
  },
  iconWrap: {
    position: 'absolute',
    right: 16,
    top: 16
  }
});
