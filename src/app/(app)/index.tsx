import { MainTemplate } from '@/domains/animal/components/templates/MainTemplate';
import { useAppReview } from '@/shared/hooks/useAppReview';
import { createStore, Provider } from 'jotai';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * 메인화면
 */
const Page = () => {
  const store = createStore();
  const requestReview = useAppReview(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestReview();
    }, 5000);
    return () => clearTimeout(timer);
  }, [requestReview]);

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
