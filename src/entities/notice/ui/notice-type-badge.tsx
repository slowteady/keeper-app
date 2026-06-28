import { styled, Text, View } from 'tamagui';

import { NOTICE_TYPE_LABEL, NoticeTypeDto } from '../schema';

export const NoticeTypeBadge = ({ type }: { type: NoticeTypeDto }) => {
  const tone = type === 'URGENT' ? 'urgent' : 'normal';
  return (
    <Badge tone={tone}>
      <BadgeText tone={tone}>{NOTICE_TYPE_LABEL[type]}</BadgeText>
    </Badge>
  );
};

const Badge = styled(View, {
  self: 'flex-start',
  px: 6,
  py: 5,
  rounded: 4,
  variants: {
    tone: {
      normal: { bg: '$white850' },
      urgent: { bg: '$errorLightest' }
    }
  } as const
});

const BadgeText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  letterSpacing: -0.24,
  variants: {
    tone: {
      normal: { color: '$black500' },
      urgent: { color: '$errorMain' }
    }
  } as const
});
