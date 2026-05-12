import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';

import { globalToast } from '@/shared/lib';

import { useAgreeCommunityPolicy, useCommunityPolicyStatus } from './use-community-policy';

/**
 * 커뮤니티 작성 진입 게이트:
 *  - 정책 동의 안 됐으면 BS 노출 (자동)
 *  - 동의 완료 시 BS 닫고 onConfirmed 콜백
 *  - 사용자가 BS dismiss(스와이프 등) 하면 onCancel
 */
export const useCommunityPolicyGate = (params: {
  enabled: boolean;
  onConfirmed: () => void;
  onCancel?: () => void;
}) => {
  const { enabled, onConfirmed, onCancel } = params;
  const sheetRef = useRef<BottomSheetModal>(null);
  const { data: status, isLoading } = useCommunityPolicyStatus(enabled);
  const { mutateAsync, isPending } = useAgreeCommunityPolicy();

  const [agreed, setAgreed] = useState(false);
  const presentedRef = useRef(false);

  // 미동의 시 자동 present, 이미 동의 상태면 즉시 onConfirmed
  useEffect(() => {
    if (!enabled || isLoading) return;
    if (status?.agreed) {
      onConfirmed();
      return;
    }
    if (!presentedRef.current) {
      presentedRef.current = true;
      sheetRef.current?.present();
    }
  }, [enabled, isLoading, status?.agreed, onConfirmed]);

  const handleConfirm = useCallback(async () => {
    if (!agreed) return;
    try {
      await mutateAsync();
      sheetRef.current?.dismiss();
      onConfirmed();
    } catch {
      globalToast('약관 동의 처리에 실패했어요. 다시 시도해주세요.', 'fail');
    }
  }, [agreed, mutateAsync, onConfirmed]);

  const handleDismiss = useCallback(() => {
    if (status?.agreed) return; // 이미 동의면 정상 흐름
    onCancel?.();
  }, [onCancel, status?.agreed]);

  return {
    sheetRef,
    agreed,
    setAgreed,
    handleConfirm,
    handleDismiss,
    isPending
  };
};
