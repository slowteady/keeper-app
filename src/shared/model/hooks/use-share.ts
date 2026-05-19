import { Buffer } from 'buffer';
import { useCallback } from 'react';
import { Alert, Platform, Share } from 'react-native';

import { useIsSharing, useSetIsSharing } from '../share/share-atom';

// Native share sheet dismiss 직후 underlying view 로 touch 가 새는 race 보호. iOS UIActivityViewController dismiss 애니메이션이 ~400ms.
const POST_SHARE_GUARD_MS = 600;

const WEB_BASE_URL = process.env.EXPO_PUBLIC_SHARE_URL;

type ShareParams = {
  title: string;
  desc: string;
  path?: string;
  id?: number | string;
  image?: string;
};

export const useShare = () => {
  const isSharing = useIsSharing();
  const setIsSharing = useSetIsSharing();

  const share = useCallback(
    async (params: ShareParams) => {
      setIsSharing(true);
      try {
        const { title, desc, path, id, image } = params;

        const tokenData = {
          title,
          desc,
          path: path || null,
          id: id ? id.toString() : null,
          image: image || null
        };

        const jsonString = JSON.stringify(tokenData);
        const base64 = Buffer.from(jsonString, 'utf-8').toString('base64');
        const token = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const shareUrl = `${WEB_BASE_URL}/share?token=${token}`;

        if (Platform.OS === 'ios') {
          await Share.share({
            url: shareUrl,
            title
          });
        } else {
          await Share.share({
            message: `${title}\n${shareUrl}`,
            title
          });
        }
      } catch {
        Alert.alert('공유 실패', '공유 중 오류가 발생했습니다');
      } finally {
        setTimeout(() => setIsSharing(false), POST_SHARE_GUARD_MS);
      }
    },
    [setIsSharing]
  );

  return { share, isSharing };
};
