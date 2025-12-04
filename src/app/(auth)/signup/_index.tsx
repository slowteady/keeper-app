import { useToastController } from '@tamagui/toast';
import { styled, Text, YStack } from 'tamagui';

import { useSignupUser } from '@/features';
import { BottomButton, CancelModal } from '@/shared';

const Page = () => {
  const { actions, flags } = useSignupUser();
  const { show } = useToastController();

  return (
    <>
      <Container>
        <SubContainer>
          <Text fontSize={26} lineHeight={36} fontWeight="600" mb={32}>
            {'어떤 닉네임으로\n불러드릴까요?'}
          </Text>
          <BottomButton isLoading={flags.isPending}>
            <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
              등록하기
            </Text>
          </BottomButton>
        </SubContainer>
      </Container>
      <CancelModal open={flags.showCancelModal} onClose={actions.closeModal} onConfirm={actions.executeCancel} />
    </>
  );
};

export default Page;

const Container = styled(YStack, {
  flex: 1,
  px: 20,
  bg: '$pageBackground'
});

const SubContainer = styled(YStack, {
  flex: 1,
  pt: 48
});
