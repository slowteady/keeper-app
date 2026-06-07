import { CircleHelp, Info, Megaphone } from '@tamagui/lucide-icons';

export const SHARE_TITLE = 'Keeper';
export const SHARE_DESC = '유기동물들의 가족이 되어주세요';

export const REVIEW_CARD_DESC = '따뜻한 리뷰는 운영에 큰 힘이 돼요';
export const SHARE_CARD_DESC = '함께 알릴수록 더 빨리 가족을 찾아요';

export const MENU_ITEMS = [
  { icon: CircleHelp, label: '문의하기', navigateTo: 'inquiry', requireAuth: true },
  { icon: Megaphone, label: '공지사항', navigateTo: 'notice', requireAuth: false },
  { icon: Info, label: '앱정보', navigateTo: 'app-info', requireAuth: false }
] as const;
