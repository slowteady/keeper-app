import { useState } from 'react';

import { AgreementState, NicknameForm, SignupAgreement, useSignup } from '@/features/auth';
import { CancelModal } from '@/shared/ui';

const Page = () => {
  const { signup, closeModal, cancel, showCancelModal, isPending } = useSignup();
  const [agreement, setAgreement] = useState<AgreementState>({ age14: false, terms: false, privacy: false });

  const allAgreed = agreement.age14 && agreement.terms && agreement.privacy;

  return (
    <>
      <NicknameForm
        title={'어떤 닉네임으로\n불러드릴까요?'}
        buttonText="등록하기"
        onSubmit={(nickname) => signup(nickname, agreement)}
        isPending={isPending}
        extraDisabled={!allAgreed}
      >
        <SignupAgreement value={agreement} onChange={setAgreement} />
      </NicknameForm>

      <CancelModal
        open={showCancelModal}
        onClose={closeModal}
        onConfirm={cancel}
        description="지금 나가시면 회원가입이 완료되지 않아요"
      />
    </>
  );
};

export default Page;
