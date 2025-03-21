import { TransformedAbandonmentDetail } from '@/businesses/abandonmentsBusiness';
import { MoreImageIcon } from '@/components/atoms/icons/MoreImageIcon';
import NoImage from '@/components/molecules/placeholder/NoImage';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import ImageViewer from '@/components/molecules/viewer/ImageViewer';
import theme from '@/constants/theme';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AbandonmentDetailCardSectionProps {
  data: TransformedAbandonmentDetail;
}
const AbandonmentDetailCardSection = ({ data }: AbandonmentDetailCardSectionProps) => {
  const [isLoad, setIsLoad] = useState(false);
  const [isError, setIsError] = useState(false);
  const [openImgViewer, setOpenImgViewer] = useState(false);
  const { title, uri, description } = data;

  const handlePressImage = () => {
    setOpenImgViewer((prev) => !prev);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isLoad) {
      timeoutId = setTimeout(() => {
        setIsError(true);
      }, 10000);
    }

    return () => clearTimeout(timeoutId);
  }, [uri, isLoad]);

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {!isLoad && !isError && <Skeleton style={styles.skeleton} />}
        {uri && !isError ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePressImage}
            disabled={!isLoad || !uri}
            style={{ width: '100%', height: '100%' }}
          >
            <Image source={{ uri }} onLoad={() => setIsLoad(true)} style={styles.image} contentFit="cover" />
            <View style={styles.iconWrap}>
              <MoreImageIcon color={theme.colors.black[900]} />
            </View>
          </TouchableOpacity>
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
    width: imgWidth,
    height: imgHeight,
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
    width: '100%',
    height: '100%',
    borderRadius: 10
  }
});
