import { Buffer } from 'buffer';
import { useCallback } from 'react';
import { Alert, Share } from 'react-native';

const SHARE_TITLE = 'Keeper - 유기동물 입양';
const SHARE_DESC = '사랑스러운 반려동물과 함께할 가족을 찾습니다.';

interface SharePostParams {
  id: number;
  title?: string;
  image?: string;
}

export const useSharePost = () => {
  const sharePost = useCallback(async ({ id, title, image }: SharePostParams) => {
    try {
      // token 데이터 생성
      const tokenData = {
        id: id.toString(),
        title: title || SHARE_TITLE,
        desc: SHARE_DESC,
        image: image || 'https://your-default-image.jpg'
      };

      // base64 인코딩
      const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

      // 웹 URL 생성
      const shareUrl = `https://keeper-web-eight.vercel.app?token=${token}`;

      // React Native Share API 사용
      const result = await Share.share({
        message: shareUrl,
        title: '친구에게 공유하기'
      });

      if (result.action === Share.sharedAction) {
        console.log('공유 성공');
      } else if (result.action === Share.dismissedAction) {
        console.log('공유 취소');
      }
    } catch (error) {
      console.error('공유 중 오류 발생:', error);
      Alert.alert('공유 실패', '공유 중 오류가 발생했습니다.');
    }
  }, []);

  return { actions: { sharePost } };
};
