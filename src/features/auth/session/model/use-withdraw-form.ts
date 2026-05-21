import { useCallback, useMemo, useState } from 'react';

import { DeleteMeBodyDto, WithdrawReason } from '@/entities/auth';

import { useDeleteUser } from './use-delete-user';

export const WITHDRAW_REASONS: { code: WithdrawReason; label: string }[] = [
  { code: 'ADOPTED', label: '입양을 이미 완료했어요' },
  { code: 'PAUSE', label: '잠시 이용을 중단하고 싶어요' },
  { code: 'INFO_NOT_FOUND', label: '원하는 정보나 기능을 찾기 어려웠어요' },
  { code: 'UX_ISSUE', label: '앱 사용이 불편했어요 (속도, 알림, 오류 등)' },
  { code: 'PRIVACY_CONCERN', label: '개인정보 보호나 알림 수신이 부담돼요' },
  { code: 'REJOIN_LATER', label: '탈퇴 후 재가입 할 거에요' },
  { code: 'OTHER', label: '기타' }
];

export const useWithdrawForm = () => {
  const { deleteUser, openWithdrawModal } = useDeleteUser();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState('');

  const selected = selectedIndex !== null ? WITHDRAW_REASONS[selectedIndex] : null;
  const isOther = selected?.code === 'OTHER';
  const canSubmit = selected !== null && (!isOther || detail.trim().length > 0);

  const submit = useCallback(() => {
    if (!canSubmit || !selected) return;
    const body: DeleteMeBodyDto = {
      reason: selected.code,
      reasonDetail: isOther ? detail.trim() : undefined
    };
    openWithdrawModal(() => {
      void deleteUser(body);
    });
  }, [canSubmit, selected, isOther, detail, openWithdrawModal, deleteUser]);

  return useMemo(
    () => ({
      reasons: WITHDRAW_REASONS,
      selectedIndex,
      selectReason: setSelectedIndex,
      detail,
      setDetail,
      isOther,
      canSubmit,
      submit
    }),
    [selectedIndex, detail, isOther, canSubmit, submit]
  );
};
