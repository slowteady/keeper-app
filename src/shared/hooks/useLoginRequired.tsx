import { router, usePathname } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { Button, Text, View, XStack, YStack } from 'tamagui';

import { userAtom } from '@/domains/auth/stores';
import { getAccessToken } from '@/shared/utils';

import { useModal } from '../components/_organisms/Modal/ModalProvider';

export interface LoginRequiredOptions {
  title?: string;
  description?: string;
  loginButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
}

const DEFAULT_OPTIONS: Required<LoginRequiredOptions> = {
  title: '로그인이 필요해요',
  description: '이 기능을 사용하려면 로그인이 필요합니다.',
  loginButtonText: '로그인하기',
  cancelButtonText: '취소',
  onCancel: () => {}
};

/**
 * 로그인이 필요한 기능/페이지 진입 시 모달을 보여주는 훅
 */
export const useLoginRequired = () => {
  const user = useAtomValue(userAtom);
  const { open, close } = useModal();
  const pathname = usePathname();

  /**
   * 로그인 상태를 확인하고, 로그인되지 않았으면 모달을 보여줌
   * @param callback 로그인된 경우 실행할 콜백
   * @param options 모달 옵션
   * @returns Promise<boolean> - 로그인 상태 또는 사용자가 로그인을 선택했는지 여부
   */
  const requireLogin = useCallback(
    async (callback?: () => void | Promise<void>, options?: LoginRequiredOptions): Promise<boolean> => {
      // 토큰과 유저 정보 모두 확인
      const accessToken = await getAccessToken();
      const isLoggedIn = !!(accessToken && user.id);

      if (isLoggedIn) {
        await callback?.();
        return true;
      }

      // 로그인이 필요한 경우 모달 표시
      const opts = { ...DEFAULT_OPTIONS, ...options };

      return new Promise((resolve) => {
        const handleLogin = () => {
          close();
          // 현재 경로를 쿼리 파라미터로 전달
          router.push({
            pathname: '/login',
            params: { redirect: pathname }
          });
          resolve(true);
        };

        const handleCancel = () => {
          close();
          opts.onCancel();
          resolve(false);
        };

        const modalContent = (
          <View flex={1} bg="rgba(0, 0, 0, 0.5)" justify="center" items="center" px={20}>
            <YStack bg="white" rounded={16} p={24} width="100%" maxW={320} gap={24}>
              <YStack gap={12} items="center">
                <Text fontSize={18} fontWeight="600" color="$black900" text="center">
                  {opts.title}
                </Text>
                <Text fontSize={15} fontWeight="400" color="$black700" text="center" lineHeight={22}>
                  {opts.description}
                </Text>
              </YStack>

              <XStack gap={12}>
                <Button flex={1} height={48} bg="$white800" rounded={12} onPress={handleCancel}>
                  <Text fontSize={16} fontWeight="500" color="$black900">
                    {opts.cancelButtonText}
                  </Text>
                </Button>
                <Button flex={1} height={48} bg="$primaryMain" rounded={12} onPress={handleLogin}>
                  <Text fontSize={16} fontWeight="500" color="white">
                    {opts.loginButtonText}
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </View>
        );

        open(modalContent);
      });
    },
    [user, open, close, pathname]
  );

  /**
   * 로그인 상태만 확인 (모달 표시 없음)
   */
  const isLoggedIn = useCallback(async (): Promise<boolean> => {
    const accessToken = await getAccessToken();
    return !!(accessToken && user.id);
  }, [user]);

  return { requireLogin, isLoggedIn };
};
