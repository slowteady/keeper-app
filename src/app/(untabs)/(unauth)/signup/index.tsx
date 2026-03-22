import { NicknameForm } from '@/entities/auth';
import { useSignup } from '@/features/auth';
import { CancelModal } from '@/shared/ui';

const Page = () => {
  const { actions, flags } = useSignup();

  return (
    <>
      <NicknameForm
        title={'어떤 닉네임으로\n불러드릴까요?'}
        buttonText="등록하기"
        onSubmit={actions.executeSignup}
        isPending={flags.isPending}
      />

      <CancelModal
        open={flags.showCancelModal}
        onClose={actions.closeModal}
        onConfirm={actions.executeCancel}
        description="지금 나가시면 회원가입이 완료되지 않아요."
      />
    </>
  );
};

export default Page;
