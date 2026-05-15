import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { CommunityWriteHeader } from '@/entities/community';
import { CommunityPolicyBottomSheet, useCommunityPolicyGate } from '@/features/community';

const CommunityLayout = () => {
  const router = useRouter();

  // 글쓰기 진입 시 약관 동의 게이트 — 페이지 진입 전에 시트 노출, 동의 시 push
  // (write 페이지 진입 후 시트 덮어쓰기 X — 사용자 시각상 폼이 깜빡 보이는 문제 방지)
  const [shouldPromptPolicy, setShouldPromptPolicy] = useState(false);

  // useCallback 으로 콜백 identity 안정화 — useCommunityPolicyGate 내부 useEffect 가
  // onConfirmed 를 deps 로 받기 때문에, inline arrow 면 매 렌더 새 인스턴스라 effect 폭주 위험
  const handlePolicyConfirmed = useCallback(() => {
    setShouldPromptPolicy(false);
    router.push('/community/write');
  }, [router]);

  const handlePolicyCancel = useCallback(() => {
    setShouldPromptPolicy(false);
  }, []);

  const policyGate = useCommunityPolicyGate({
    enabled: shouldPromptPolicy,
    onConfirmed: handlePolicyConfirmed,
    onCancel: handlePolicyCancel
  });

  const handlePressWrite = useCallback(() => {
    setShouldPromptPolicy(true);
  }, []);

  return (
    <>
      <Stack screenOptions={{ header: () => <CommunityWriteHeader onPressWrite={handlePressWrite} /> }} />
      <CommunityPolicyBottomSheet
        ref={policyGate.sheetRef}
        agreed={policyGate.agreed}
        onChangeAgreed={policyGate.setAgreed}
        onConfirm={policyGate.handleConfirm}
        isPending={policyGate.isPending}
      />
    </>
  );
};

export default CommunityLayout;
