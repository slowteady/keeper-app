import { styled, Text, View } from 'tamagui';

import { NOTIFICATION_TYPE_LABEL, NotificationTypeDto } from '../schema';

export const NotificationTypeBadge = ({ type }: { type: NotificationTypeDto }) => (
  <Badge>
    <BadgeText>{NOTIFICATION_TYPE_LABEL[type]}</BadgeText>
  </Badge>
);

const Badge = styled(View, {
  self: 'flex-start',
  px: 6,
  py: 5,
  rounded: 4,
  bg: '$white850'
});

const BadgeText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  letterSpacing: -0.24,
  color: '$black500'
});
