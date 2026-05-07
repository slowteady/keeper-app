import { router } from 'expo-router';

import { useCurrentUser } from '@/features/auth';
import { useReview, useShare } from '@/shared/model';

import { SHARE_DESC, SHARE_TITLE } from './constants';

export const useProfileMain = () => {
  const { user, isLoading } = useCurrentUser();
  const { share } = useShare();
  const { promptReview } = useReview();

  const shareApp = () => share({ title: SHARE_TITLE, desc: SHARE_DESC });
  const goLogin = (redirect: string = '/profile') => router.push({ pathname: '/login', params: { redirect } });
  const goAccount = () => router.push({ pathname: '/profile/account' });
  const goMenu = (path: string, requireAuth: boolean) => {
    if (requireAuth && !user) {
      return goLogin(`/profile/${path}`);
    }
    router.push({ pathname: `/profile/${path}` });
  };

  return {
    user,
    isLoading,
    promptReview,
    shareApp,
    goLogin,
    goAccount,
    goMenu
  };
};
