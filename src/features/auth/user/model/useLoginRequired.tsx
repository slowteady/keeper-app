import { router, usePathname } from 'expo-router';
import { useCallback } from 'react';
import { styled, Text, YStack } from 'tamagui';

import { ModalButtons, useModal } from '@/shared';

import { useAuthUser } from './useAuthUser';

/**
 * 로그인이 필요한 기능/페이지 진입 시 모달을 보여주는 훅
 */
export const useLoginRequired = () => {
  const { data } = useAuthUser();
  const user = data?.user;

  const { open, close } = useModal();
  const pathname = usePathname();

  const isLoggedIn = !!user;

  /**
   * 로그인 상태를 확인하고, 로그인되지 않았으면 모달을 보여줌
   * @param callback 로그인된 경우 실행할 콜백
   * @param options 모달 옵션
   * @returns Promise<boolean> - 로그인 상태 또는 사용자가 로그인을 선택했는지 여부
   */
  const requireLogin = useCallback(
    async (callback?: () => void | Promise<void>): Promise<boolean> => {
      if (isLoggedIn) {
        await callback?.();
        return true;
      }

      return new Promise((resolve) => {
        const handlePressLogin = () => {
          close();
          router.push({
            pathname: '/login',
            params: { redirect: pathname }
          });
          resolve(true);
        };

        const handlePressCancel = () => {
          close();
          resolve(false);
        };

        const modalContent = (
          <ModalContainer>
            <Text mb={12} fontSize={17} fontWeight="600" color="$black800">
              로그인이 필요해요
            </Text>
            <Text mb={32} fontSize={14} fontWeight="400" color="$black500">
              로그인 후 이용해주세요
            </Text>
            <ModalButtons
              onPressSecondary={handlePressCancel}
              onPressPrimary={handlePressLogin}
              text={{ primary: '로그인하기', secondary: '닫기' }}
            />
          </ModalContainer>
        );

        open(modalContent);
      });
    },
    [close, isLoggedIn, open, pathname]
  );

  return { actions: { requireLogin }, flags: { isLoggedIn } };
};

const ModalContainer = styled(YStack, {
  width: '80%',
  rounded: 14,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16,
  items: 'flex-start',
  justify: 'center'
});
