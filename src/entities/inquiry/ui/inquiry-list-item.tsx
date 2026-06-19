import { Pressable } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { INQUIRY_TYPE_LABEL, InquiryListItemDto } from '../schema';
import { InquiryStatusBadge } from './inquiry-status-badge';

export type InquiryListItemProps = {
  data: InquiryListItemDto;
  onPress: (id: string) => void;
};

export const InquiryListItem = ({ data, onPress }: InquiryListItemProps) => (
  <Pressable onPress={() => onPress(data.id)}>
    <Container>
      <XStack items="center" gap={8}>
        <InquiryStatusBadge status={data.status} />
        <TypeChip>
          <TypeText>{INQUIRY_TYPE_LABEL[data.type]}</TypeText>
        </TypeChip>
        <DisplayTime>{formatTimeAgo(data.createdAt)}</DisplayTime>
      </XStack>
      <Preview numberOfLines={2} ellipsizeMode="tail">
        {data.contentPreview}
      </Preview>
    </Container>
  </Pressable>
);

const Container = styled(YStack, {
  py: 16,
  gap: 8,
  borderBottomWidth: 1,
  borderBottomColor: '$white850'
});

const TypeChip = styled(View, {
  px: 6,
  py: 5,
  rounded: 4,
  bg: '$white850'
});

const TypeText = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black700',
  letterSpacing: -0.24
});

const DisplayTime = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500'
});

const Preview = styled(Text, {
  fontSize: 15,
  fontWeight: '500',
  lineHeight: 22,
  color: '$black900',
  letterSpacing: -0.45
});
