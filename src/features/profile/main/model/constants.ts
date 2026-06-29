import { Bell, CircleHelp, Info, Megaphone, Share2, Star } from '@tamagui/lucide-icons';

export const MENU_SECTIONS = [
  {
    label: '설정',
    items: [{ icon: Bell, label: '알림 설정', navigateTo: 'notification-settings', requireAuth: false }]
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
