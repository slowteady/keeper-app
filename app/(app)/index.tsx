import MainTemplate from '@/components/templates/MainTemplate';
import { createStore, Provider } from 'jotai';
import { StyleSheet, View } from 'react-native';

/**
 * 메인화면
 */
const Page = () => {
  const store = createStore();

  return (
    <Provider store={store}>
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
