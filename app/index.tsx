import MainTemplate from '@/components/templates/MainTemplate';
import { Stack } from 'expo-router';
import { createStore, Provider } from 'jotai';

const Page = () => {
  const store = createStore();

  return (
    <Provider store={store}>
      <Stack.Screen options={{ headerShown: false }} />
      <MainTemplate />
    </Provider>
  );
};

export default Page;
