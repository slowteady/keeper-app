import theme from '@/constants/theme';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AbandonmentDetailInfoSectionProps {
  age: string;
  gender: string;
  weight: string;
}
const AbandonmentDetailInfoSection = ({ age, gender, weight }: AbandonmentDetailInfoSectionProps) => {
  const genderValue = gender === 'F' ? '여아' : gender === 'M' ? '남아' : '미상';

  const VALUE = useMemo(
    () => [
      { label: '나이', value: age },
      { label: '성별', value: genderValue },
      { label: '크기/몸무게', value: weight }
    ],
    [age, genderValue, weight]
  );

  return (
    <View style={styles.container}>
      {VALUE.map(({ label, value }, idx) => {
        const key = `${label}-${idx}`;

        return (
          <View key={key} style={styles.wrap}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.box}>
              <Text style={styles.value}>
                {value}
                {label === '나이' && <Text style={styles.subValue}> 년생</Text>}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default AbandonmentDetailInfoSection;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  wrap: {
    flex: 1,
    gap: 10
  },
  label: {
    color: theme.colors.black[600],
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center'
  },
  box: {
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.white[600],
    paddingVertical: 16,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    color: theme.colors.black[800]
  },
  subValue: {
    color: theme.colors.black[600],
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18
  }
});
