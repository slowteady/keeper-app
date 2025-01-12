import DetailHeader from '@/components/organisms/headers/DetailHeader';
import AbandonmentsTemplate from '@/components/templates/abandonments/AbandonmentsTemplate';
import theme from '@/constants/theme';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const Page = () => {
  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        <AbandonmentsTemplate />
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
