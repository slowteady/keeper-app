import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="login/index" options={{ title: '로그인' }} />
      <Stack.Screen name="signup/index" options={{ title: '회원가입' }} />
    </Stack>
  );
};

export default AuthLayout;

