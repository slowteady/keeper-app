import { Stack } from 'expo-router';

const AdoptLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '입양공고'
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: '입양공고 상세',
          presentation: 'card'
        }}
      />
    </Stack>
  );
};

export default AdoptLayout;

