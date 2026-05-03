import { Bell, Bolt, Heart, Megaphone, MessageCircleQuestion } from '@tamagui/lucide-icons';

export const SHARE_TITLE = 'Keeper';
export const SHARE_DESC = '유기동물들의 가족이 되어주세요';

export const MENU_ITEMS = [
  { icon: Heart, label: '좋아요', navigateTo: 'like' },
  { icon: Megaphone, label: '공지사항', navigateTo: 'notice' },
  { icon: MessageCircleQuestion, label: '문의하기', navigateTo: 'inquiry' },
  { icon: Bell, label: '알림설정', navigateTo: 'notification' },
  { icon: Bolt, label: '앱정보', navigateTo: 'appInfo' }
] as const;
