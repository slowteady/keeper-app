import { AlertTriangle } from '@tamagui/lucide-icons';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { CONTACT_SAFETY_NOTICE } from '../lib/constants';

export const ContactSafetyNotice = () => {
  const { noticeMain } = useTheme();
  return (
    <Box>
      <AlertTriangle size={16} color={noticeMain.val as never} />
      <Notice>{CONTACT_SAFETY_NOTICE}</Notice>
    </Box>
  );
};

const Box = styled(XStack, {
  bg: '$noticeLightest',
  borderLeftWidth: 3,
  borderLeftColor: '$noticeMain',
  rounded: 8,
  px: 14,
  py: 12,
  gap: 8,
  items: 'flex-start'
});

const Notice = styled(Text, {
  flex: 1,
  fontSize: 13,
  lineHeight: 22,
  color: '$black800',
  letterSpacing: -0.25
});
