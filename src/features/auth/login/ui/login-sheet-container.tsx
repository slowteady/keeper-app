import { useEffect } from 'react';

import { useBottomSheet } from '@/shared/ui';

import { useLoginSheet } from '../model/use-login-sheet';
import { AgreementFooter } from './agreement-footer';
import { AgreementStep } from './agreement-step';
import { LoginSheetView } from './login-sheet';

export const LoginSheet = () => {
  const {
    step,
    isGoogleAvailable,
    isAppleAvailable,
    onSocialResponse,
    devLogin,
    agreements,
    setAgreements,
    allRequiredAgreed,
    submitAgreement,
    viewPolicy,
    isPending
  } = useLoginSheet();

  const { setFooter } = useBottomSheet();

  useEffect(() => {
    if (step !== 'agreement') {
      setFooter(undefined);
      return;
    }
    setFooter(() => (
      <AgreementFooter allRequiredAgreed={allRequiredAgreed} onSubmit={submitAgreement} isPending={isPending} />
    ));
    return () => setFooter(undefined);
  }, [step, allRequiredAgreed, isPending, submitAgreement, setFooter]);

  if (step === 'agreement') {
    return <AgreementStep agreements={agreements} onChange={setAgreements} onViewPolicy={viewPolicy} />;
  }

  return (
    <LoginSheetView
      onResponse={onSocialResponse}
      isGoogleAvailable={isGoogleAvailable}
      isAppleAvailable={isAppleAvailable}
      onDevLogin={() => devLogin(11)}
    />
  );
};
