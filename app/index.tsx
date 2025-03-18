import MainHeader from '@/components/organisms/headers/MainHeader';
import MainTemplate from '@/components/templates/MainTemplate';
import { Stack } from 'expo-router';
import { createStore, Provider } from 'jotai';
import { StyleSheet, View } from 'react-native';

/**
 * 메인화면
 * TODO
 * [ ] 전체공고 섹션 노데이터 처리
 * [ ] 전체공고 섹션 스켈레톤 처리
 * [ ] 보호소 섹션 노데이터 처리
 * [ ] 보호소 섹션 스켈레톤 처리
 * [ ] 에러 바운더리
 */
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
