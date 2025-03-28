import NoImage, { NoImageProps } from '@/components/molecules/placeholder/NoImage';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import theme from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface AnimalCardData<T> {
  id: number;
  uri: string;
  title: string;
  description: { label: string; value: string }[];
  chips?: ({ sort: number } & BasicCardChipsValue<T>)[];
}
interface AnimalCardProps<T> extends NoImageProps {
  data: AnimalCardData<T>;
  width: number;
  height: number;
  size?: AnimalCardSize;
}
type AnimalCardSize = 'small' | 'medium';

export const AnimalCard = <T,>({ data, width, height, size = 'medium', style }: AnimalCardProps<T>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const { uri, title, description, chips } = data;
  const sortedChips = chips?.sort((a, b) => a.sort - b.sort);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isLoaded) {
      timeoutId = setTimeout(() => {
        setIsError(true);
      }, 10000);
    }

    return () => clearTimeout(timeoutId);
  }, [uri, isLoaded]);

  const titleStyle = size === 'small' ? { fontSize: 18, lineHeight: 20 } : { fontSize: 20, lineHeight: 22 };

  return (
    <View style={{ width }}>
      <View style={{ width, height, marginBottom: 20 }}>
        {!isLoaded && !isError && <Skeleton style={styles.skeleton} />}
        {uri && !isError ? (
          <ExpoImage
            source={{ uri }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsError(true)}
            style={styles.image}
          />
        ) : (
          <NoImage style={style} />
        )}
      </View>
      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { ...titleStyle }]}>
        {title}
      </Text>
      <View style={[styles.descriptionContainer]}>
        <Descriptions data={description} size={size} />
      </View>
      {sortedChips && <Chips data={sortedChips} size={size} />}
    </View>
  );
};

export interface BasicCardDescriptionsProps {
  data: BasicCardDescriptionsValue[];
  size?: AnimalCardSize;
}
export interface BasicCardDescriptionsValue {
  label: string;
  value: string;
}
const Descriptions = ({ data, size = 'medium' }: BasicCardDescriptionsProps) => {
  const wrapStyle = size === 'small' ? {} : { gap: 16 };
  const titleStyle = size === 'small' ? { fontSize: 13, lineHeight: 15 } : { fontSize: 15, lineHeight: 17 };

  return data.map(({ label, value }, idx) => {
    const key = `${label}-${idx}`;

    return (
      <View key={key} style={[wrapStyle, styles.descriptionWrap]}>
        <Text style={[titleStyle, styles.label]}>{label}</Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={[titleStyle, styles.text]}>
          {value}
        </Text>
      </View>
    );
  });
};

export interface BasicCardChipsProps<T> {
  data: BasicCardChipsValue<T>[];
  size?: AnimalCardSize;
}
export interface BasicCardChipsValue<T> {
  id: T;
  value: string;
  variant?: ChipVariant;
}
export type ChipVariant = 'error' | 'success' | 'notice' | 'default';
const Chips = <T,>({ data, size }: BasicCardChipsProps<T>) => {
  const containerStyle = { gap: 4 };
  const chipContainerStyle = { paddingHorizontal: 6, paddingVertical: 4 };
  const textStyle = { fontSize: 11, lineHeight: 13 };

  return (
    <View style={[containerStyle, styles.chipsBlockContainer]}>
      {data.map(({ id, value, variant }, idx) => {
        const key = `${id}-${idx}`;
        const { containerStyle, chipStyle } = getChipStyle(variant);

        return (
          <View key={key} style={[styles.chipsContainer, chipContainerStyle, containerStyle]}>
            <Text style={[styles.chipText, textStyle, chipStyle]}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
};

const getChipStyle = (variant?: ChipVariant) => {
  const { error, success, notice, white, black } = theme.colors;

  const styles = {
    error: {
      containerStyle: { backgroundColor: error.lightest },
      chipStyle: { color: error.main }
    },
    success: {
      containerStyle: { backgroundColor: success.lightest },
      chipStyle: { color: success.main }
    },
    notice: {
      containerStyle: { backgroundColor: notice.lightest },
      chipStyle: { color: notice.main }
    },
    default: {
      containerStyle: { backgroundColor: white[800] },
      chipStyle: { color: black[600] }
    }
  };

  return styles[variant ?? 'default'];
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    width: '100%',
    height: '100%'
  },
  title: {
    color: theme.colors.black[900],
    fontWeight: '500',
    marginBottom: 20
  },
  chipsBlockContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8
  },
  chipsContainer: {
    alignSelf: 'baseline',
    borderRadius: 2
  },
  chipText: {
    fontWeight: '400'
  },
  descriptionContainer: {
    display: 'flex',
    marginBottom: 20,
    gap: 10
  },
  descriptionWrap: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center'
  },
  label: {
    flexShrink: 0,
    color: theme.colors.black[600],
    fontWeight: '400',
    minWidth: 57
  },
  text: {
    flex: 1,
    color: theme.colors.black[900],
    fontWeight: '400',
    marginRight: 6
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 8
  }
});
