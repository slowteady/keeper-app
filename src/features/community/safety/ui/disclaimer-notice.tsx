import { Info } from '@tamagui/lucide-icons';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { ADOPT_DISCLAIMER } from '../lib/constants';

export const DisclaimerNotice = () => {
  const { errorMain } = useTheme();
  return (
    <Box>
      <Info size={16} color={errorMain.val as never} />
      <Notice>{ADOPT_DISCLAIMER}</Notice>
    </Box>
  );
};

const Box = styled(XStack, {
  bg: '$white850',
  borderLeftWidth: 3,
  borderLeftColor: '$primaryMain',
  rounded: 8,
  px: 14,
  py: 12,
  gap: 8,
  items: 'flex-start'
});

const Notice = styled(Text, {
  flex: 1,
  fontSize: 13,
  lineHeight: 20,
  color: '$black800',
  letterSpacing: -0.25
});
