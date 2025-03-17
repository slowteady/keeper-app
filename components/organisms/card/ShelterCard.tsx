import theme from '@/constants/theme';
import { ShelterValue } from '@/types/scheme/shelters';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ShelterCardProps {
  data: ShelterValue;
  onPress: (id: number) => void;
}
const ShelterCard = ({ data, onPress }: ShelterCardProps) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onPress(data.id)}>
        <ShrinkCard data={data} />
      </Pressable>
    </View>
  );
};

export default ShelterCard;

interface ShrinkCardProps {
  data: ShelterValue;
}
const ShrinkCard = ({ data }: ShrinkCardProps) => {
  const { name, distance, address } = data;
  const convertedDistance = Math.round(distance * 10) / 10;
  const convertedAddress = address.split(' ').slice(0, 3).join(' ');

  return (
    <View style={[styles.shrinkContainer]}>
      <View style={[styles.titleWrap]}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.nameText]}>
          {name}
        </Text>
      </View>
      <View style={[styles.labelWrap]}>
        <Text style={[styles.locationText]}>{convertedDistance}km</Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.locationText, { marginLeft: 4, color: theme.colors.black[500] }]}
        >
          {convertedAddress}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white[900],
    borderRadius: 4
  },
  shrinkContainer: {
    padding: 20
  },
  descriptionContainer: {
    paddingVertical: 24
  },
  nameText: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '500',
    color: theme.colors.black[900]
  },
  locationText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 15,
    color: theme.colors.black[800]
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  labelText: {
    color: theme.colors.black[500],
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '400',
    marginLeft: 4
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.black[500],
    height: '95%',
    marginHorizontal: 10
  },
  expandNameText: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '600',
    color: theme.colors.black[900],
    paddingHorizontal: 20
  },
  horizontalDivider: {
    borderWidth: theme.hairline,
    borderColor: theme.colors.white[600]
  }
});
