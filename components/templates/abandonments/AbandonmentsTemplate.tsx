import BasicTab from '@/components/molecules/tab/BasicTab';
import { ABANDONMENTS_CONF } from '@/constants/config';
import theme from '@/constants/theme';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const AbandonmentsTemplate = () => {
  const [filter, setFilter] = useState<(typeof ABANDONMENTS_CONF)[number]>(ABANDONMENTS_CONF[0]);

  const handleChangeFilter = useCallback((value: (typeof ABANDONMENTS_CONF)[number]) => {
    setFilter(value);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>전체공고</Text>
      </View>

      <BasicTab category={ABANDONMENTS_CONF} value={filter} onChange={handleChangeFilter} />
    </View>
  );
};

export default AbandonmentsTemplate;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 26,
    fontWeight: '500'
  }
});
