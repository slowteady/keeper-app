import { View } from 'tamagui';

import { WithdrawForm } from '@/features/auth';
import { ModalPageHeader, ModalProvider } from '@/shared/ui';

const Page = () => (
  <View flex={1} bg="$pageBackground">
    <ModalPageHeader title="회원탈퇴" fullScreen />
    <ModalProvider>
      <WithdrawForm />
    </ModalProvider>
  </View>
);

export default Page;
