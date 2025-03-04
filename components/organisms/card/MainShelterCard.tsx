import theme from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface MainShelterCardProps {
  name: string;
  address: string;
  tel: string;
}

const MainShelterCard = ({ name, address, tel }: MainShelterCardProps) => {
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
    borderRadius: 8,
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
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 19
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
    fontSize: 14,
    color: theme.colors.black[600],
    lineHeight: 16,
    fontWeight: '400'
  }
});
