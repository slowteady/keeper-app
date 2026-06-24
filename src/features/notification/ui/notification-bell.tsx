import { Bell } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { styled, Text, View } from 'tamagui';

import { useUnreadCount } from '../model/use-unread-count';

export const NotificationBell = () => {
  const { badge } = useUnreadCount();

  return (
    <View onPress={() => router.push('/(untabs)/notifications')} hitSlop={10}>
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
