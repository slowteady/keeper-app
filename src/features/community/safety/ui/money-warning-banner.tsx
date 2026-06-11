import { AlertTriangle } from '@tamagui/lucide-icons';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { CONTACT_MONEY_WARNING } from '../lib/constants';

export const MoneyWarningBanner = () => {
  const { errorMain } = useTheme();
  return (
    <Box>
      <AlertTriangle size={16} color={errorMain.val as never} />
      <WarningText>{CONTACT_MONEY_WARNING}</WarningText>
    </Box>
  );
};

const Box = styled(XStack, {
  bg: '$errorLight',
  borderLeftWidth: 3,
  borderLeftColor: '$errorMain',
  rounded: 8,
  px: 14,
  py: 12,
  gap: 8,
  items: 'flex-start',
  mb: 12
});

const WarningText = styled(Text, {
  flex: 1,
  fontSize: 13,
  lineHeight: 19,
  fontWeight: '500',
  color: '$black800',
  letterSpacing: -0.25
});
