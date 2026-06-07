import { router } from 'expo-router';

import { useCurrentUser, useOpenLoginSheet } from '@/features/auth';
import { useReview, useShare } from '@/shared/model';

export const useProfileMain = () => {
  const { user, isLoading } = useCurrentUser();
  const { share } = useShare();
  const { promptReview } = useReview();
  const openLoginSheet = useOpenLoginSheet();

  const shareApp = () => share({ type: 'app' });
  const goLogin = () => openLoginSheet();
  const goAccount = () => router.push({ pathname: '/profile/account' });
  const goLike = () => router.push({ pathname: '/profile/like' });
  const goActivity = () => router.push({ pathname: '/profile/activity' });
  const goMenu = (path: string, requireAuth: boolean) => {
    if (requireAuth && !user) {
      return goLogin();
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
    goLike,
    goActivity,
    goMenu
  };
};
