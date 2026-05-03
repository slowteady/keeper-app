import * as Application from 'expo-application';
import { router } from 'expo-router';

import { useCurrentUser, useLogout } from '@/features/auth';
import { useReview, useShare } from '@/shared/model';

import { SHARE_DESC, SHARE_TITLE } from './constants';

export const useProfileMain = () => {
  const { user, isLoading } = useCurrentUser();
  const { logout } = useLogout();
  const { share } = useShare();
  const { promptReview } = useReview();
  const version = Application.nativeApplicationVersion;

  const shareApp = () => share({ title: SHARE_TITLE, desc: SHARE_DESC });
  const goLogin = () => router.push({ pathname: '/login', params: { redirect: '/profile' } });
  const goAccount = () => router.push({ pathname: '/profile/account' });
  const goMenu = (path: string) => router.push({ pathname: `/profile/${path}` });

  return {
    user,
    isLoading,
    version,
    logout,
    promptReview,
    shareApp,
    goLogin,
    goAccount,
    goMenu
  };
};
