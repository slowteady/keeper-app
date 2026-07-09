import { useCallback } from 'react';
import { Alert, Platform, Share } from 'react-native';

import { pressHaptic } from '@/shared/lib';
import { ANALYTICS_EVENT, useAnalytics } from '@/shared/lib/analytics';

import { useIsSharing, useSetIsSharing } from '../share/share-atom';

// Native share sheet dismiss 직후 underlying view 로 touch 가 새는 race 보호. iOS UIActivityViewController dismiss 애니메이션이 ~400ms.
const POST_SHARE_GUARD_MS = 600;

const WEB_BASE_URL = process.env.EXPO_PUBLIC_SHARE_URL ?? 'https://our-keeper.com';

type ShareParams =
  | {
      type: 'adopt' | 'shelter' | 'community' | 'missing';
      id: number | string;
    }
  | {
      type: 'app';
    };

export const useShare = () => {
  const isSharing = useIsSharing();
  const setIsSharing = useSetIsSharing();
  const { track } = useAnalytics();

  const share = useCallback(
    async (params: ShareParams) => {
      pressHaptic();
      setIsSharing(true);
      try {
        const shareUrl =
          params.type === 'app'
            ? WEB_BASE_URL
            : `${WEB_BASE_URL}/share/${params.type}/${encodeURIComponent(params.id.toString())}`;

        const result =
          Platform.OS === 'ios'
            ? await Share.share({ url: shareUrl, title: 'keeper' })
            : await Share.share({ message: shareUrl, title: 'keeper' });

        if (result.action === Share.sharedAction) {
          track(
            ANALYTICS_EVENT.contentShared,
            params.type === 'app' ? { type: 'app' } : { type: params.type, id: String(params.id) }
          );
        }
      } catch {
        Alert.alert('공유하지 못했어요', '공유 중 오류가 생겼어요');
      } finally {
        setTimeout(() => setIsSharing(false), POST_SHARE_GUARD_MS);
      }
    },
    [setIsSharing, track]
  );

  return { share, isSharing };
};
