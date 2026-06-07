import { fireEvent, render } from '@testing-library/react-native';
import { Pressable as MockPressable, Text as MockText, View as MockView } from 'react-native';

import { createWrapper } from '@/test/create-wrapper';

import { ProfileActivityScene } from './profile-activity-scene';

jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ ListEmptyComponent, ListFooterComponent }: any) => (
    <MockView>
      {ListEmptyComponent}
      {ListFooterComponent}
    </MockView>
  )
}));

jest.mock('@/entities/comment', () => ({
  CommentCardSkeleton: () => <MockView testID="activity-skeleton" />
}));

jest.mock('@/entities/community', () => ({
  CommentListItem: () => null,
  CommunityPostListItem: () => null
}));

jest.mock('@/features/profile', () => ({
  useMyPosts: () => mockLoadingList(),
  useMyComments: () => mockLoadingList()
}));

jest.mock('@/shared/ui', () => ({
  ButtonGroup: ({ data, onChange }: any) => (
    <MockView>
      {data.map(({ id }: { id: string }) => (
        <MockPressable key={id} onPress={() => onChange(id)}>
          <MockText>{id}</MockText>
        </MockPressable>
      ))}
    </MockView>
  ),
  FeedNodata: () => null
}));

const mockLoadingList = () => ({
  items: [],
  isLoading: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn()
});

describe('ProfileActivityScene', () => {
  it('내 글과 내 댓글 최초 로딩에 댓글 카드 스켈레톤을 표시한다', () => {
    const screen = render(<ProfileActivityScene />, { wrapper: createWrapper() });

    expect(screen.getAllByTestId('activity-skeleton')).toHaveLength(5);

    fireEvent.press(screen.getByText('comment'));
    expect(screen.getAllByTestId('activity-skeleton')).toHaveLength(5);
  });
});
