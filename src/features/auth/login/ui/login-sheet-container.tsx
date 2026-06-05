import { Route } from 'expo-router';

import { useLoginSheet } from '../model/use-login-sheet';
import { AgreementStep } from './agreement-step';
import { LoginSheetView } from './login-sheet';

export const LoginSheet = ({ redirect }: { redirect?: Route }) => {
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
  } = useLoginSheet(redirect);

  if (step === 'agreement') {
    return (
      <AgreementStep
        agreements={agreements}
        onChange={setAgreements}
        allRequiredAgreed={allRequiredAgreed}
        onSubmit={submitAgreement}
        onViewPolicy={viewPolicy}
        isPending={isPending}
      />
    );
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
