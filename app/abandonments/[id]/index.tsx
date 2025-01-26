import DetailHeader from '@/components/organisms/headers/DetailHeader';
import AbandonmentsDetailTemplate from '@/components/templates/abandonments/AbandonmentsDetailTemplate';
import theme from '@/constants/theme';
import { useGetAbandonment } from '@/hooks/queries/useAbandonments';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useGetAbandonment(Number(id));

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        <AbandonmentsDetailTemplate data={data} isLoading={isLoading} />
      </View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
