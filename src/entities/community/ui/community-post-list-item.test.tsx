import { render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { CommunityAdoptListDto } from '../schema';
import { CommunityPostListItem } from './community-post-list-item';

const baseData: CommunityAdoptListDto = {
  id: '1',
  user: null,
  displayTime: new Date().toISOString(),
  title: '코코를 가족으로',
  images: [],
  counts: { like: 0, view: 0, comment: 0 },
  isLiked: false
};

describe('CommunityPostListItem', () => {
  it('status 가 주어지면 상태 칩을 표시한다', () => {
    const screen = render(
      <CommunityPostListItem
        data={baseData}
        categoryLabel="내 공고"
        status={{ label: '입양중', tone: 'notice' }}
        onPress={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('입양중')).toBeTruthy();
  });

  it('status 가 없으면 상태 칩을 표시하지 않는다', () => {
    const screen = render(<CommunityPostListItem data={baseData} categoryLabel="내 공고" onPress={jest.fn()} />, {
      wrapper: createWrapper()
    });

    expect(screen.queryByText('입양중')).toBeNull();
  });
});
