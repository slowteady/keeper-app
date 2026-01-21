import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const WithdrawLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="회원탈퇴" /> }} />;
};

export default WithdrawLayout;
