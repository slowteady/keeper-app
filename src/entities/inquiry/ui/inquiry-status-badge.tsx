import { styled, Text, View } from 'tamagui';

import { INQUIRY_STATUS_LABEL, InquiryStatusDto } from '../schema';

const STATUS_TONE = {
  RECEIVED: 'neutral',
  IN_PROGRESS: 'notice',
  DONE: 'success'
} as const;

export const InquiryStatusBadge = ({ status }: { status: InquiryStatusDto }) => {
  const tone = STATUS_TONE[status];
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
