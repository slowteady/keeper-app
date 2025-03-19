import { CandyIcon } from '@/components/atoms/icons/CandyIcon';
import { MessageIcon } from '@/components/atoms/icons/MessageIcon';
import { StarbarIcon } from '@/components/atoms/icons/StarbarIcon';
import theme from '@/constants/theme';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AbandonmentDetailDescriptionSectionProps {
  specialMark: string;
  neuterYn: string;
  shelter?: {
    id: number;
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
  const { id, time, person, address, name } = shelter || {};
  const neuter = neuterYn === 'N' ? 'X' : 'O';

  const handlePress = () => {
    if (!id) return;

    router.push({
      pathname: '/shelters/[id]',
      params: { id }
    });
  };

  return (
    <>
      <View style={[styles.pointBox, { paddingTop: 40 }]}>
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
          <StarbarIcon width={20} height={20} />
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
          {!shelter && <Text style={styles.description}>정보 없음</Text>}
          {name && (
            <Pressable onPress={handlePress}>
              <Text style={styles.shelterText}>{name}</Text>
            </Pressable>
          )}
          {time && <Text style={styles.description}>{time}</Text>}
          {person && <Text style={styles.description}>{person}</Text>}
          {address && <Text style={styles.description}>{address}</Text>}
        </View>
      </View>
    </>
  );
};

export default AbandonmentDetailDescriptionSection;

const styles = StyleSheet.create({
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
    minWidth: 100,
    paddingHorizontal: 20
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    color: theme.colors.black[800]
  },
  shelterText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    flexShrink: 1,
    paddingRight: 10,
    color: theme.colors.black[700],
    textDecorationLine: 'underline'
  },
  description: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    color: theme.colors.black[700],
    flexShrink: 1,
    paddingRight: 24
  },
  divider: {
    borderWidth: theme.hairline,
    borderColor: theme.colors.white[600]
  },
  shelter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1
  }
});
