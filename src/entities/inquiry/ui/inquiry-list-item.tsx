import { ChevronRight } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { INQUIRY_STATUS_LABEL, INQUIRY_TYPE_LABEL, InquiryListItemDto } from '../schema';

export type InquiryListItemProps = {
  data: InquiryListItemDto;
  onPress: (id: string) => void;
};

const STATUS_TONE = {
  RECEIVED: 'neutral',
  IN_PROGRESS: 'notice',
  DONE: 'success'
} as const;

export const InquiryListItem = ({ data, onPress }: InquiryListItemProps) => (
  <Pressable onPress={() => onPress(data.id)}>
    <Container>
      <YStack flex={1} gap={6}>
        <Meta>{`${INQUIRY_TYPE_LABEL[data.type]} · ${formatTimeAgo(data.createdAt)}`}</Meta>
        <Preview numberOfLines={2} ellipsizeMode="tail">
          {data.contentPreview}
        </Preview>
      </YStack>
      <StatusRow>
        <StatusLabel tone={STATUS_TONE[data.status]}>{INQUIRY_STATUS_LABEL[data.status]}</StatusLabel>
        <ChevronRight size={16} color="#ADB3AF" />
      </StatusRow>
    </Container>
  </Pressable>
);

const Container = styled(XStack, {
  py: 16,
  gap: 12,
  items: 'flex-start',
  borderBottomWidth: 1,
  borderBottomColor: '$white850'
});

const Meta = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.24
});

const Preview = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 23,
  color: '$black900',
  letterSpacing: -0.4
});

const StatusRow = styled(XStack, {
  shrink: 0,
  items: 'center',
  gap: 2,
  pt: 1
});

const StatusLabel = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  letterSpacing: -0.26,
  variants: {
    tone: {
      neutral: { color: '$black500' },
      notice: { color: '$noticeMain' },
      success: { color: '$successMain' }
    }
  } as const
});
