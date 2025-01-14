import { LogoEmblem } from '@/components/atoms/icons/LogoIcon';
import { Description } from '@/components/atoms/text/Description';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import theme from '@/constants/theme';
import { Image as ExpoImage, ImageProps } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, TextProps, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

interface BasicCardData<T> {
  id: number;
  uri: string;
  title: string;
  description: { label: string; value: string }[];
  chips: ({ sort: number } & BasicCardChipsValue<T>)[];
}
interface BasicCardProps<T> {
  data: BasicCardData<T>;
  isLoading?: boolean;
  width: number;
  height: number;
}
const Complete = <T,>({ data, isLoading, width, height }: BasicCardProps<T>) => {
  const [isLoad, setIsLoad] = useState(false);

  const { uri, title, description, chips } = data;
  const sortedChips = chips.sort((a, b) => a.sort - b.sort);
  const isCompleteLoad = !isLoading && isLoad;

  return (
    <View style={{ width }}>
      <View style={{ width, height, marginBottom: 24 }}>
        {!isCompleteLoad && <Skeleton />}
        {uri ? <Image source={{ uri }} onLoad={() => setIsLoad(true)} /> : <NoImage />}
      </View>
      <Title style={{ marginBottom: 20 }}>{title}</Title>
      <Chips data={sortedChips} />
      <Descriptions data={description} />
    </View>
  );
};

const Image = ({ style, ...props }: ImageProps) => {
  return <ExpoImage style={[styles.image, style]} {...props} />;
};

export interface BasicCardTitleProps extends TextProps {
  children: React.ReactNode;
}
const Title = ({ children, style, ...props }: BasicCardTitleProps) => {
  return (
    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, style]} {...props}>
      {children}
    </Text>
  );
};

export interface BasicCardChipsProps<T> extends ViewProps {
  data: BasicCardChipsValue<T>[];
}
export interface BasicCardChipsValue<T> {
  id: T;
  value: string;
  containerStyle?: ViewStyle;
  chipStyle?: TextStyle;
}
const Chips = <T,>({ data, style }: BasicCardChipsProps<T>) => {
  return (
    <View style={[styles.chipsBlockContainer, style]}>
      {data.map(({ id, value, containerStyle, chipStyle }, idx) => {
        const key = `${id}-${idx}`;

        return (
          <View key={key} style={[styles.chipsContainer, containerStyle]}>
            <Text style={[styles.chipText, chipStyle]}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
};

export interface BasicCardDescriptionsProps {
  data: BasicCardDescriptionsValue[];
  style?: ViewStyle;
  primaryStyle?: TextStyle;
  secondaryStyle?: TextStyle;
}
export interface BasicCardDescriptionsValue {
  label: string;
  value: string;
}
const Descriptions = ({ data, style, primaryStyle, secondaryStyle }: BasicCardDescriptionsProps) => {
  return data.map(({ label, value }, idx) => {
    const key = `${label}-${idx}`;

    return (
      <Description
        key={key}
        PrimaryTextProps={{ children: label, style: { minWidth: 55, ...primaryStyle } }}
        SecondaryTextProps={{ children: value, style: { ...secondaryStyle } }}
        style={style}
      />
    );
  });
};

const NoImage = ({ style }: Record<string, ViewStyle>) => {
  return (
    <View style={[styles.image, styles.flex, { backgroundColor: theme.colors.background.default }, style]}>
      <Text style={styles.noImageText}>No Image</Text>
      <LogoEmblem />
    </View>
  );
};

export const BasicCard = Object.assign(Complete, {
  Image,
  Title,
  Descriptions,
  Chips,
  NoImage
});

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    width: '100%',
    height: '100%'
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 22
  },
  chipsBlockContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 24,
    minHeight: 60
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
  }
});
