import { router } from 'expo-router';
import { useTheme, View } from 'tamagui';

import { useLoginRequired } from '@/features';
import { HeaderLayout } from '@/shared';
import { Logo, Pencil } from '@/shared/ui/icons/outline';

export const CommunityWriteHeader = () => {
  const { black900, black800 } = useTheme();
  const { actions } = useLoginRequired();

  const handlePressWrite = async () => {
    // await requireLogin(() => router.push('/community/write'));
    router.push('/community/write');
  };

  const left = <Logo width={96} height={30} color={black900.val} />;

  const right = (
    <View onPress={handlePressWrite} hitSlop={10}>
      <Pencil width={22} height={22} color={black800.val} />
    </View>
  );

  return <HeaderLayout left={left} right={right} />;
};
