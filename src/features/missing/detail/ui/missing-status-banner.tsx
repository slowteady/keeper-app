import { ReactNode } from 'react';
import { styled, Text, XStack, YStack } from 'tamagui';

import { MISSING_STATUS_INFO } from '@/entities/missing';
import { MISSING_RED, MISSING_RED_LIGHT } from '@/shared/lib';

type Props = {
  isResolved: boolean;
  action?: ReactNode;
};

export const MissingStatusBanner = ({ isResolved, action }: Props) => {
  const tone = isResolved ? 'resolved' : 'missing';
  const info = MISSING_STATUS_INFO[isResolved ? 'RESOLVED' : 'MISSING'];

  return (
    <BannerWrap tone={tone}>
      <YStack flex={1} gap={4}>
        <BannerLabel tone={tone}>{info.label}</BannerLabel>
        <BannerText>{info.bannerText}</BannerText>
      </YStack>
      {action}
    </BannerWrap>
  );
};

const BannerWrap = styled(XStack, {
  mx: 20,
  mt: 16,
  mb: 20,
  px: 16,
  py: 14,
  gap: 12,
  rounded: 10,
  items: 'center',
  borderLeftWidth: 4,
  variants: {
    tone: {
      missing: { backgroundColor: MISSING_RED_LIGHT, borderLeftColor: MISSING_RED },
      resolved: { backgroundColor: '$successLightest', borderLeftColor: '$successMain' }
    }
  } as const
});

const BannerLabel = styled(Text, {
  fontWeight: 700,
  fontSize: 13,
  lineHeight: 15,
  variants: {
    tone: {
      missing: { color: MISSING_RED },
      resolved: { color: '$successMain' }
    }
  } as const
});

const BannerText = styled(Text, {
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 20,
  color: '$black900'
});
