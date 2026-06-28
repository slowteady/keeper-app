import { styled, Text, View, XStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { InquiryReplyDto } from '../schema';

export const InquiryReplyCard = ({ data }: { data: InquiryReplyDto }) => (
  <Card>
    <XStack items="center" justify="space-between">
      <Author>keeper 운영팀</Author>
      <DisplayTime>{formatTimeAgo(data.createdAt)}</DisplayTime>
    </XStack>
    <Body>{data.body}</Body>
  </Card>
);

const Card = styled(View, {
  gap: 8,
  p: 16,
  rounded: 12,
  bg: '$white850'
});

const Author = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  color: '$black900'
});

const DisplayTime = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500'
});

const Body = styled(Text, {
  fontSize: 15,
  fontWeight: '400',
  lineHeight: 22,
  color: '$black800',
  letterSpacing: -0.3
});
