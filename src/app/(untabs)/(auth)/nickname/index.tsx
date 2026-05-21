import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';

import { authQueries, updateMe } from '@/entities/auth';
import { NicknameForm, useCurrentUser } from '@/features/auth';
import { globalToast } from '@/shared/lib';

const Page = () => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueries.all() });
      router.back();
    },
    onError: (error) => {
      const isConflict = axios.isAxiosError(error) && error.response?.status === 409;
      globalToast(isConflict ? '이미 사용 중인 닉네임이에요' : '닉네임 변경에 실패했어요 다시 시도해주세요', 'fail');
    }
  });

  return (
    <NicknameForm
      title={'어떤 닉네임으로\n변경할까요?'}
      buttonText="등록하기"
      onSubmit={(nickname) => mutate({ nickname })}
      isPending={isPending}
      initialValue={user?.nickname}
    />
  );
};

export default Page;
