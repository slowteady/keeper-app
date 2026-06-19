import { ScrollView } from 'react-native';
import { Spinner, styled, Text, View, XStack, YStack } from 'tamagui';

import { INQUIRY_TYPE_LABEL, InquiryReplyCard, InquiryStatusBadge } from '@/entities/inquiry';
import { useInquiryDetail } from '@/features/inquiry';
import { formatTimeAgo } from '@/shared/lib';
import { ImageSelector } from '@/shared/ui';

import { ProfileEmptyState } from './profile-empty-state';

export const InquiryDetailScene = ({ id }: { id: string }) => {
  const { data, isLoading, isError } = useInquiryDetail(id);

  if (isLoading) {
    return (
      <Container items="center" justify="center">
        <Spinner color="$black500" />
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container>
        <ProfileEmptyState text="문의를 찾을 수 없어요" description="삭제되었거나 접근할 수 없는 문의예요" />
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <QuestionCard>
          <XStack items="center" gap={8}>
            <InquiryStatusBadge status={data.status} />
            <TypeChip>
              <TypeText>{INQUIRY_TYPE_LABEL[data.type]}</TypeText>
            </TypeChip>
            <DisplayTime>{formatTimeAgo(data.createdAt)}</DisplayTime>
          </XStack>
          <Content>{data.content}</Content>
          {data.images.length > 0 && <ImageSelector value={data.images} readOnly size={72} />}
        </QuestionCard>

        <ReplyLabel>운영자 답변</ReplyLabel>
        {data.replies.length > 0 ? (
          <YStack gap={12}>
            {data.replies.map((reply) => (
              <InquiryReplyCard key={reply.id} data={reply} />
            ))}
          </YStack>
        ) : (
          <PendingText>답변을 준비하고 있어요</PendingText>
        )}
      </ScrollView>
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  bg: '$pageBackground'
});

const QuestionCard = styled(YStack, {
  gap: 12,
  pb: 24,
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

const Content = styled(Text, {
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 24,
  color: '$black900',
  letterSpacing: -0.32
});

const ReplyLabel = styled(Text, {
  fontSize: 15,
  fontWeight: '600',
  color: '$black900',
  mt: 24,
  mb: 12
});

const PendingText = styled(Text, {
  fontSize: 14,
  fontWeight: '400',
  color: '$black500',
  py: 20,
  text: 'center'
});
