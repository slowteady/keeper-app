import DetailHeader from '@/components/organisms/headers/DetailHeader';
import { Slot, Stack } from 'expo-router';
import { createStore, Provider } from 'jotai';

const AbandonmentsLayout = () => {
  const store = createStore();

  return (
    <Provider store={store}>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />
      <Slot />
    </Provider>
  );
};

export default AbandonmentsLayout;
