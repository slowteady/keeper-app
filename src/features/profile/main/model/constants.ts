import { Bell, CircleHelp, Info, MapPin, Megaphone, Share2, Star } from '@tamagui/lucide-icons';

export const SHARE_TITLE = 'Keeper';
export const SHARE_DESC = '유기동물들의 가족이 되어주세요';

export const MENU_SECTIONS = [
  {
    label: '설정',
    items: [
      { icon: Bell, label: '알림 설정', navigateTo: 'notification-settings', requireAuth: false },
      { icon: MapPin, label: '위치 설정', action: 'location' }
    ]
  },
  {
    label: '지원',
    items: [
      { icon: Megaphone, label: '공지사항', navigateTo: 'notice', requireAuth: false },
      { icon: CircleHelp, label: '문의', navigateTo: 'inquiry', requireAuth: true },
      { icon: Info, label: '앱 정보', navigateTo: 'app-info', requireAuth: false }
    ]
  },
  {
    label: 'keeper 응원하기',
    items: [
      { icon: Star, label: '앱 리뷰 남기기', action: 'review' },
      { icon: Share2, label: '친구에게 공유하기', action: 'share' }
    ]
  }
] as const;
