import { render } from '@testing-library/react-native';
import { Pressable as MockPressable, Text as MockText, View as MockView } from 'react-native';

import { createWrapper } from '@/test/create-wrapper';

import { ProfileLikeScene } from './profile-like-scene';

jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ ListEmptyComponent }: any) => <MockView>{ListEmptyComponent}</MockView>
}));

jest.mock('@/entities/adopt', () => ({
  ADOPT_CARD_IMAGE_SIZES: { small: 160 },
  AdoptCard: () => null,
  AdoptCardSkeleton: () => null,
  mapToAdoptList: (items: unknown[]) => items
}));

jest.mock('@/entities/community', () => ({
  CommunityPostListItem: () => null
}));

jest.mock('@/entities/shelter', () => ({
  ShelterCard: () => null,
  ShelterCardSkeleton: () => null
}));

jest.mock('@/features/favorite-abandonment', () => ({
  useFavoriteAbandonment: () => ({ toggleFavoriteAbandonment: jest.fn() }),
  useMyFavoriteAbandonments: () => ({
    items: [{ id: 'a1' }],
    isLoading: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn()
  })
}));

jest.mock('@/features/favorite-shelter', () => ({
  useFavoriteShelter: () => ({ toggleFavoriteShelter: jest.fn() }),
  useMyFavoriteShelters: () => ({ items: [], isLoading: false, fetchNextPage: jest.fn(), refetch: jest.fn() })
}));

jest.mock('@/features/like-post', () => ({
  useLikePost: () => ({ toggleLikePost: jest.fn() }),
  useMyLikedPosts: () => ({ items: [], isLoading: false, fetchNextPage: jest.fn(), refetch: jest.fn() })
}));

jest.mock('@/shared/ui', () => ({
  ButtonGroup: ({ data, onChange }: any) => (
    <MockView>
      {data.map(({ id, label }: { id: string; label: string }) => (
        <MockPressable key={id} onPress={() => onChange(id)}>
          <MockText>{label}</MockText>
        </MockPressable>
      ))}
    </MockView>
  ),
  FilterChip: ({ label, onPress }: any) => (
    <MockPressable onPress={onPress}>
      <MockText>{label}</MockText>
    </MockPressable>
  ),
  useBottomSheetMenu: () => ({ open: jest.fn() }),
  FeedNodata: () => null
}));

describe('ProfileLikeScene', () => {
  it('상위 탭(공고/보호소/커뮤니티)과 공고 탭의 세부 필터 드롭다운을 렌더한다', () => {
    const screen = render(<ProfileLikeScene />, { wrapper: createWrapper() });

    expect(screen.getByText('공고')).toBeTruthy();
    expect(screen.getByText('보호소')).toBeTruthy();
    expect(screen.getByText('커뮤니티')).toBeTruthy();
    expect(screen.getByText('보호소 공고')).toBeTruthy();
  });
});
