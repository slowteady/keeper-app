import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { styled, Text } from 'tamagui';

import { authQueries, updateMe } from '@/entities/auth';
import { NicknameForm, useCurrentUser } from '@/features/auth';
import { formatNicknameNextChangeDate, getNicknameCooldownDays, globalToast } from '@/shared/lib';
import { CancelModal } from '@/shared/ui';

const Page = () => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [pendingNickname, setPendingNickname] = useState<string | null>(null);

  const cooldownDays = getNicknameCooldownDays(user?.nicknameUpdatedAt);
  const isCoolingDown = cooldownDays > 0;

  const { mutate, isPending } = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueries.all() });
      router.back();
    },
    onError: (error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 409) return globalToast('이미 사용 중인 닉네임이에요', 'fail');
      if (status === 429) return globalToast('아직 닉네임을 변경할 수 없어요', 'fail');
      globalToast('닉네임을 변경하지 못했어요', 'fail');
    }
  });

  return (
    <>
      <NicknameForm
        title="어떤 닉네임으로 변경할까요?"
        buttonText="등록하기"
        onSubmit={(nickname) => setPendingNickname(nickname)}
        isPending={isPending}
        initialValue={user?.nickname}
        extraDisabled={isCoolingDown}
        locked={isCoolingDown}
      >
        {isCoolingDown ? (
          <Notice color="$errorMain">
            최근 닉네임을 변경했어요. {formatNicknameNextChangeDate(user?.nicknameUpdatedAt ?? new Date())}부터 다시
            변경할 수 있어요
          </Notice>
        ) : (
          <Notice>닉네임은 30일에 한 번만 바꿀 수 있어요</Notice>
        )}
      </NicknameForm>

      <CancelModal
        open={pendingNickname !== null}
        onClose={() => setPendingNickname(null)}
        onConfirm={() => {
          if (pendingNickname) mutate({ nickname: pendingNickname });
          setPendingNickname(null);
        }}
        title="닉네임을 변경할까요?"
        description={`지금 변경하면 ${formatNicknameNextChangeDate(new Date())}까지 다시 바꿀 수 없어요`}
        confirmText="변경"
        cancelText="취소"
      />
    </>
  );
};

export default Page;

const Notice = styled(Text, {
  mt: 12,
  fontSize: 13,
  lineHeight: 18,
  fontWeight: '500',
  color: '$black500'
});
