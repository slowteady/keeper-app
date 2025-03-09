import { CandyIcon } from '@/components/atoms/icons/CandyIcon';
import { MessageIcon } from '@/components/atoms/icons/MessageIcon';
import theme from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface AbandonmentDetailDescriptionSectionProps {
  specialMark: string;
  neuterYn: string;
  shelter?: {
    time: string;
    person: string;
    address: string;
    name: string;
  };
}

const AbandonmentDetailDescriptionSection = ({
  specialMark,
  neuterYn,
  shelter
}: AbandonmentDetailDescriptionSectionProps) => {
  const { time, person, address, name } = shelter || {};
  const neuter = neuterYn === 'N' ? 'X' : 'O';

  return (
    <View style={styles.container}>
      <View style={styles.pointBox}>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>특징</Text>
          <MessageIcon width={20} height={20} />
        </View>
        <Text style={styles.description}>{specialMark}</Text>
      </View>
      <View style={styles.divider} />

      <View style={styles.pointBox}>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>중성화</Text>
        </View>
        <Text style={styles.description}>{neuter}</Text>
      </View>
      <View style={styles.divider} />

      <View style={styles.pointBox}>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>보호소</Text>
          <CandyIcon width={20} height={20} />
        </View>
        <View style={styles.shelter}>
          {name && <Text style={styles.description}>{name}</Text>}
          {time && <Text style={styles.description}>{time}</Text>}
          {person && <Text style={styles.description}>{person}</Text>}
          {address && <Text style={styles.description}>{address}</Text>}
        </View>
      </View>
    </View>
  );
};

export default AbandonmentDetailDescriptionSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20
  },
  pointBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 24
  },
  labelWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 80
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: theme.colors.black[800]
  },
  description: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 23,
    color: theme.colors.black[700],
    flexShrink: 1
  },
  divider: {
    borderWidth: theme.hairline,
    borderColor: theme.colors.white[600]
  },
  shelter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1
  }
});
