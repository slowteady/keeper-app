import { Stack } from 'expo-router';

const ShelterLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '내위치'
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: '보호소 상세',
          presentation: 'card'
        }}
      />
    </Stack>
  );
};

export default ShelterLayout;

