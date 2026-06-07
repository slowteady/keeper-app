import { fireEvent, render } from '@testing-library/react-native';
import { Pressable as MockPressable, Text as MockText, View as MockView } from 'react-native';

import { createWrapper } from '@/test/create-wrapper';

import { ProfileLikeScene } from './profile-like-scene';

jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ ListEmptyComponent, ListFooterComponent }: any) => (
    <MockView>
      {ListEmptyComponent}
      {ListFooterComponent}
    </MockView>
  )
}));

jest.mock('@/entities/adopt', () => ({
  ADOPT_CARD_IMAGE_SIZES: { small: 160 },
  AdoptCard: () => null,
  AdoptCardSkeleton: () => <MockView testID="adopt-skeleton" />,
  mapToAdoptList: () => []
}));

jest.mock('@/entities/comment', () => ({
  CommentCardSkeleton: () => <MockView testID="comment-skeleton" />
}));

jest.mock('@/entities/community', () => ({
  CommentListItem: () => null,
  CommunityPostListItem: () => null
}));

jest.mock('@/entities/shelter', () => ({
  ShelterCard: () => null,
  ShelterCardSkeleton: () => <MockView testID="shelter-skeleton" />
}));

jest.mock('@/features/favorite-abandonment', () => ({
  useFavoriteAbandonment: () => ({ toggleFavoriteAbandonment: jest.fn() }),
  useMyFavoriteAbandonments: () => mockLoadingList()
}));

jest.mock('@/features/favorite-shelter', () => ({
  useFavoriteShelter: () => ({ toggleFavoriteShelter: jest.fn() }),
  useMyFavoriteShelters: () => mockLoadingList()
}));

jest.mock('@/features/like-post', () => ({
  useLikePost: () => ({ toggleLikePost: jest.fn() }),
  useMyLikedPosts: () => mockLoadingList()
}));

jest.mock('@/features/helpful-comment', () => ({
  useMyHelpfulComments: () => mockLoadingList()
}));

jest.mock('@/features/community', () => ({
  useCommentHelpful: () => ({ toggleHelpful: jest.fn() })
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
  FeedNodata: () => null,
  Skeleton: () => null
}));

const mockLoadingList = () => ({
  items: [],
  isLoading: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn()
});

describe('ProfileLikeScene', () => {
  it('각 관심 탭의 최초 로딩에 카드 형태 스켈레톤을 표시한다', () => {
    const screen = render(<ProfileLikeScene />, { wrapper: createWrapper() });

    expect(screen.getAllByTestId('adopt-skeleton')).toHaveLength(4);

    fireEvent.press(screen.getByText('shelter'));
    expect(screen.getAllByTestId('shelter-skeleton')).toHaveLength(4);

    fireEvent.press(screen.getByText('post'));
    expect(screen.getAllByTestId('comment-skeleton')).toHaveLength(5);

    fireEvent.press(screen.getByText('comment'));
    expect(screen.getAllByTestId('comment-skeleton')).toHaveLength(5);
  });
});
