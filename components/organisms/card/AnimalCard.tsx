import { LogoEmblem } from '@/components/atoms/icons/LogoIcon';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import theme from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface AnimalCardData<T> {
  id: number;
  uri: string;
  title: string;
  description: { label: string; value: string }[];
  chips?: ({ sort: number } & BasicCardChipsValue<T>)[];
}
interface AnimalCardProps<T> {
  data: AnimalCardData<T>;
  width: number;
  height: number;
  size?: AnimalCardSize;
}
type AnimalCardSize = 'small';

export const AnimalCard = <T,>({ data, width, height, size = 'small' }: AnimalCardProps<T>) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { uri, title, description, chips } = data;
  const sortedChips = chips?.sort((a, b) => a.sort - b.sort);

  return (
    <View style={{ width }}>
      <View style={{ width, height, marginBottom: 20 }}>
        {!isLoaded && <Skeleton />}
        {uri ? <ExpoImage source={{ uri }} onLoad={() => setIsLoaded(true)} style={styles.image} /> : <NoImage />}
      </View>

      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { marginBottom: 24 }]}>
        {title}
      </Text>

      <Descriptions data={description} />
      {sortedChips && (
        <View style={{ marginTop: 24 }}>
          <Chips data={sortedChips} />
        </View>
      )}
    </View>
  );
};

export interface BasicCardDescriptionsProps {
  data: BasicCardDescriptionsValue[];
}
export interface BasicCardDescriptionsValue {
  label: string;
  value: string;
}
const Descriptions = ({ data }: BasicCardDescriptionsProps) => {
  return data.map(({ label, value }, idx) => {
    const key = `${label}-${idx}`;

    return (
      <View key={key} style={styles.descriptionContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>
          {value}
        </Text>
      </View>
    );
  });
};

export interface BasicCardChipsProps<T> {
  data: BasicCardChipsValue<T>[];
}
export interface BasicCardChipsValue<T> {
  id: T;
  value: string;
  variant?: ChipVariant;
}
export type ChipVariant = 'error' | 'success' | 'notice' | 'default';
const Chips = <T,>({ data }: BasicCardChipsProps<T>) => {
  return (
    <View style={styles.chipsBlockContainer}>
      {data.map(({ id, value, variant }, idx) => {
        const key = `${id}-${idx}`;
        const { containerStyle, chipStyle } = getChipStyle(variant);

        return (
          <View key={key} style={[styles.chipsContainer, containerStyle]}>
            <Text style={[styles.chipText, chipStyle]}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
};

const NoImage = ({ style }: Record<string, ViewStyle>) => {
  return (
    <View style={[styles.image, styles.flex, { backgroundColor: theme.colors.background.default }, style]}>
      <Text style={styles.noImageText}>No Image</Text>
      <LogoEmblem />
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
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 22
  },
  chipsBlockContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    rowGap: 8
  },
  chipsContainer: {
    alignSelf: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 3
  },
  chipText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  noImageText: {
    color: theme.colors.black[400],
    fontSize: 19,
    fontWeight: '600'
  },
  descriptionContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    gap: 16,
    alignItems: 'center',
    marginBottom: 12
  },
  label: {
    flexShrink: 0,
    fontSize: 15,
    color: theme.colors.black[600],
    fontWeight: '400',
    lineHeight: 17,
    minWidth: 55
  },
  text: {
    flex: 1,
    color: theme.colors.black[900],
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 17
  }
});
