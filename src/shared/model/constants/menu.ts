import { Heart, Home2, MapPin, Message, User } from '@/shared/ui/icons/outline';

export const MENU_ITEMS = [
  { name: 'home', label: 'Home', icon: Home2 },
  { name: 'adopt', label: '입양공고', icon: Heart },
  { name: 'shelter', label: '내위치', icon: MapPin },
  { name: 'community', label: '커뮤니티', icon: Message },
  { name: 'profile', label: '프로필', icon: User }
] as const;
