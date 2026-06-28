import { useCallback } from 'react';
import { Alert, Platform, Share } from 'react-native';

import { pressHaptic } from '@/shared/lib';

import { useIsSharing, useSetIsSharing } from '../share/share-atom';

// Native share sheet dismiss 직후 underlying view 로 touch 가 새는 race 보호. iOS UIActivityViewController dismiss 애니메이션이 ~400ms.
const POST_SHARE_GUARD_MS = 600;

const WEB_BASE_URL = process.env.EXPO_PUBLIC_SHARE_URL ?? 'https://our-keeper.com';

type ShareParams =
  | {
      type: 'adopt' | 'shelter' | 'community';
      id: number | string;
    }
  | {
      type: 'app';
    };

export const useShare = () => {
  const isSharing = useIsSharing();
  const setIsSharing = useSetIsSharing();

  const share = useCallback(
    async (params: ShareParams) => {
      pressHaptic();
      setIsSharing(true);
      try {
        const shareUrl =
          params.type === 'app'
            ? WEB_BASE_URL
            : `${WEB_BASE_URL}/share/${params.type}/${encodeURIComponent(params.id.toString())}`;

        if (Platform.OS === 'ios') {
          await Share.share({
            url: shareUrl,
            message: 'Keeper에서 확인해보세요',
            title: 'Keeper'
          });
        } else {
          await Share.share({
            message: `Keeper에서 확인해보세요\n${shareUrl}`,
            title: 'Keeper'
          });
        }
      } catch {
        Alert.alert('공유하지 못했어요', '공유 중 오류가 생겼어요');
      } finally {
        setTimeout(() => setIsSharing(false), POST_SHARE_GUARD_MS);
      }
    },
    [setIsSharing]
  );

  return { share, isSharing };
};
