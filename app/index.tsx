import MainHeader from '@/components/organisms/headers/MainHeader';
import MainTemplate from '@/components/templates/MainTemplate';
import { Stack } from 'expo-router';
import { createStore, Provider } from 'jotai';
import { StyleSheet, View } from 'react-native';

const Page = () => {
  const store = createStore();

  return (
    <Provider store={store}>
      <Stack.Screen options={{ header: () => <MainHeader /> }} />

      <View style={styles.container}>
        <MainTemplate />
      </View>
    </Provider>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
