import { type Href, router } from 'expo-router';

export const safeBack = (fallback: Href = '/(tabs)/home') => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
};
