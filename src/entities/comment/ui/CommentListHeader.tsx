import { styled, Text, XStack, YStack } from 'tamagui';

import { CommentSortOrderDto } from '../model';

export interface CommentListHeaderProps {
  commentCount: number;
  sortOrder: CommentSortOrderDto;
  onChangeSortOrder: (order: CommentSortOrderDto) => void;
}

export const CommentListHeader = ({ commentCount = 0, sortOrder, onChangeSortOrder }: CommentListHeaderProps) => {
  const isLatest = sortOrder === 'LATEST';
  const isCreated = sortOrder === 'CREATED';

  return (
    <Container>
      <OverViewWrapper>
        <XStack items="center" gap={4}>
          <Text fontWeight={500} color="$black600">
            댓글
          </Text>
          <Text fontWeight={500} color="$black800">
            {commentCount}개
          </Text>
        </XStack>

        <XStack items="center" gap={10}>
          <SortText active={isLatest} onPress={() => onChangeSortOrder('LATEST')}>
            최신순
          </SortText>
          <SortText active={isCreated} onPress={() => onChangeSortOrder('CREATED')}>
            등록순
          </SortText>
        </XStack>
      </OverViewWrapper>
    </Container>
  );
};

const Container = styled(YStack, {
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: '$white600',
  bg: '$white850'
});

const OverViewWrapper = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  p: 20
});

const SortText = styled(Text, {
  fontWeight: '500',
  animation: 'quick',
  pressStyle: {
    scale: 0.97
  },
  variants: {
    active: {
      true: {
        color: '$black800'
      },
      false: {
        color: '#0000004D'
      }
    }
  } as const,
  defaultVariants: {
    active: false
  }
});
