import { Bell } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { styled, Text, View } from 'tamagui';

import { useCurrentUser, useOpenLoginSheet } from '@/features/auth';

import { useUnreadCount } from '../model/use-unread-count';

export const NotificationBell = () => {
  const { badge } = useUnreadCount();
  const { isLoggedIn } = useCurrentUser();
  const openLoginSheet = useOpenLoginSheet();

  const handlePress = () => {
    if (!isLoggedIn) {
      openLoginSheet();
      return;
    }
    router.push('/(untabs)/notifications');
  };

  return (
    <View onPress={handlePress} hitSlop={10}>
      <Bell size={26} color="$black900" />
      {badge ? (
        <Badge>
          <BadgeText>{badge}</BadgeText>
        </Badge>
      ) : null}
    </View>
  );
};

const Badge = styled(View, {
  position: 'absolute',
  t: -6,
  r: -8,
  minW: 18,
  height: 18,
  rounded: 9,
  px: 4,
  bg: '$errorMain',
  items: 'center',
  justify: 'center'
});

const BadgeText = styled(Text, {
  fontSize: 11,
  fontWeight: '700',
  lineHeight: 13,
  color: '$white900'
});
