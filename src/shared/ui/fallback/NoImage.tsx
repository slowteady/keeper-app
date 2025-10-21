import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { theme } from '@/shared';

import { Paw } from '../icons/solid';

export interface NoImageProps {
  style?: ViewStyle;
}
export const NoImage = ({ style }: NoImageProps) => {
  return (
    <View style={[styles.image, styles.flex, { backgroundColor: theme.colors.background.default }, style]}>
      <Text style={styles.noImageText}>No Image</Text>
      <Paw width={22} height={22} color={theme.colors.black[400]} />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    width: '100%',
    height: '100%'
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
