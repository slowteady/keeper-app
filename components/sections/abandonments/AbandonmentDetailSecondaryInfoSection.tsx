import { MessageIcon } from '@/components/atoms/icons/MessageIcon';
import theme from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface AbandonmentDetailSecondaryInfoSectionProps {
  specialMark: string;
}

const AbandonmentDetailSecondaryInfoSection = ({ specialMark }: AbandonmentDetailSecondaryInfoSectionProps) => {
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
    </View>
  );
};

export default AbandonmentDetailSecondaryInfoSection;

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
    paddingRight: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: theme.colors.black[800]
  },
  description: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: theme.colors.black[700],
    alignSelf: 'center'
  },
  divider: {
    borderBottomWidth: theme.hairline,
    borderColor: theme.colors.white[600]
  }
});
