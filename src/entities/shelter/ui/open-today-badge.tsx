import { styled, Text, View } from 'tamagui';

type OpenTodayBadgeProps = {
  open: boolean | null;
};

export const OpenTodayBadge = ({ open }: OpenTodayBadgeProps) => {
  if (open === null) return null;

  return (
    <Badge open={open}>
      <BadgeText open={open}>{open ? '오늘 운영중' : '오늘 휴무'}</BadgeText>
    </Badge>
  );
};

const Badge = styled(View, {
  px: 6,
  py: 2,
  rounded: 4,
  variants: {
    open: {
      true: { bg: '$successLightest' },
      false: { bg: '$white850' }
    }
  } as const
});

const BadgeText = styled(Text, {
  fontSize: 11,
  lineHeight: 13,
  fontWeight: '500',
  variants: {
    open: {
      true: { color: '$successMain' },
      false: { color: '$black500' }
    }
  } as const
});
