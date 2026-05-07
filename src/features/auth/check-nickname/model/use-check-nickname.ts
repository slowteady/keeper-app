import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { checkNickname } from '@/entities/auth';
import { useDebounceValue } from '@/shared/model';

export type NicknameStatus = {
  status: 'default' | 'success' | 'error';
  message: string;
};

export const useCheckNickname = (initialValue: string = '') => {
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [nickname, setNickname] = useState(initialValue);
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>({
    status: 'default',
    message: '*기호, 특수문자 제외 2~10자'
  });

  const debouncedNickname = useDebounceValue(nickname, 1000);

  const { mutate } = useMutation({ mutationFn: checkNickname });

  const changeNickname = useCallback(
    (nickname: string) => {
      const filtered = nickname.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g, '');
      setNickname(filtered);

      setIsChecking(filtered.length >= 2 && filtered !== initialValue);
      setIsComplete(false);
      setNicknameStatus({
        status: 'default',
        message: '*기호, 특수문자 제외 2~10자'
      });
    },
    [initialValue]
  );

  const clearNickname = useCallback(() => {
    setNickname('');
    setIsChecking(false);
    setIsComplete(false);
    setNicknameStatus({
      status: 'default',
      message: '*기호, 특수문자 제외 2~10자'
    });
  }, []);

  useEffect(() => {
    if (debouncedNickname.length < 2 || debouncedNickname === initialValue) {
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
              message: '*사용할 수 없는 닉네임이에요'
            });
          } else {
            setNicknameStatus({
              status: 'success',
              message: '*사용가능한 닉네임이에요'
            });

            setIsComplete(true);
          }
        },
        onSettled: () => {
          setIsChecking(false);
        }
      }
    );
  }, [debouncedNickname, initialValue, mutate]);

  useEffect(() => {
    setNickname(initialValue);
  }, [initialValue]);

  return { nickname, nicknameStatus, isChecking, isComplete, changeNickname, clearNickname };
};
