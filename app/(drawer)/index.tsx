import MainTemplate from '@/components/templates/MainTemplate';
import { createStore, Provider } from 'jotai';
import { StyleSheet, View } from 'react-native';

/**
 * 메인화면
 * TODO
 * [ ] 보호소 섹션 노데이터 처리
 * [ ] 보호소 섹션 스켈레톤 처리
 * [ ] 에러 바운더리
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
