import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { checkNickname } from '@/entities/auth/model/api';
import { useDebounceValue } from '@/shared/model';

export type NicknameStatus = {
  status: 'default' | 'success' | 'error';
  message: string;
};

export const useCheckNickname = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>({
    status: 'default',
    message: '*기호, 특수문자 제외 8자 가능'
  });

  const debouncedNickname = useDebounceValue(nickname, 1000);

  const { mutate } = useMutation({ mutationFn: checkNickname });

  const changeNickname = useCallback((nickname: string) => {
    // 필터링: 특수문자 제거
    const filtered = nickname.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g, '');
    setNickname(filtered);

    // 유효한 값이면 상태 초기화 및 검사 시작
    setIsChecking(true);
    setIsComplete(false);
    setNicknameStatus({
      status: 'default',
      message: '*기호, 특수문자 제외 8자 가능'
    });
  }, []);

  const clearNickname = useCallback(() => {
    setNickname('');
    setIsChecking(false);
    setIsComplete(false);
    setNicknameStatus({
      status: 'default',
      message: '*기호, 특수문자 제외 8자 가능'
    });
  }, []);

  useEffect(() => {
    if (debouncedNickname === '') {
      setIsChecking(false);
      return;
    }

    mutate(
      { nickname: debouncedNickname },
      {
        onSuccess: (response) => {
          const isDuplicated = response.data.data;

          if (isDuplicated) {
            setIsComplete(false);
            setNicknameStatus({
              status: 'error',
              message: '*사용할 수 없는 닉네임이에요.'
            });
          } else {
            setNicknameStatus({
              status: 'success',
              message: '*사용가능한 닉네임이에요.'
            });

            setIsComplete(true);
          }
        },
        onSettled: () => {
          setIsChecking(false);
        }
      }
    );
  }, [debouncedNickname, mutate]);

  return {
    state: { nickname, nicknameStatus },
    flags: { isChecking, isComplete },
    actions: { changeNickname, clearNickname }
  };
};
