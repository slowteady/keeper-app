import { styled, Text, View } from 'tamagui';

import { INQUIRY_STATUS_LABEL, INQUIRY_STATUS_TONE, InquiryStatusDto } from '../schema';

export const InquiryStatusBadge = ({ status }: { status: InquiryStatusDto }) => {
  const tone = INQUIRY_STATUS_TONE[status];
  return (
    <Badge tone={tone}>
      <BadgeText tone={tone}>{INQUIRY_STATUS_LABEL[status]}</BadgeText>
    </Badge>
  );
};

const Badge = styled(View, {
  px: 6,
  py: 5,
  rounded: 4,
  variants: {
    tone: {
      neutral: { bg: '$white850' },
      notice: { bg: '$noticeLightest' },
      success: { bg: '$successLightest' }
    }
  } as const
});

const BadgeText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  letterSpacing: -0.24,
  variants: {
    tone: {
      neutral: { color: '$black500' },
      notice: { color: '$noticeMain' },
      success: { color: '$successMain' }
    }
  } as const
});
