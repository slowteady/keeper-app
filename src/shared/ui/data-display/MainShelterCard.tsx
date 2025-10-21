import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/shared';

import { AnimatedHeart } from '../icons/animation';

export interface MainShelterCardProps {
  name: string;
  address: string;
  tel: string;
}

export const MainShelterCard = ({ name, address, tel }: MainShelterCardProps) => {
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
        <AnimatedHeart size={18} />
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
                style={[styles.description, { color: '#505050', flex: 1, letterSpacing: -0.25 }]}
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderColor: theme.colors.white[800],
    borderWidth: 1,
    backgroundColor: theme.colors.white[900],
    paddingHorizontal: 18,
    paddingVertical: 20,
    width: 270
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    flex: 1,
    color: theme.colors.black[900],
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.white[800],
    marginBottom: 16
  },
  descriptionWrap: {
    paddingVertical: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  descriptionRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  description: {
    fontSize: 14,
    color: theme.colors.black[600],
    lineHeight: 16,
    fontWeight: '500'
  }
});
