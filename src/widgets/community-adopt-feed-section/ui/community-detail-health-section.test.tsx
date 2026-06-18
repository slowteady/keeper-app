import { render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { CommunityDetailHealthSection } from './community-detail-health-section';

describe('CommunityDetailHealthSection', () => {
  it('모든 항목이 미상이고 건강 특이사항도 없으면 섹션을 렌더하지 않는다', () => {
    const { queryByText } = render(
      <CommunityDetailHealthSection neuterYn="U" vaccinationCheck="" healthCheck="" health="" />,
      { wrapper: createWrapper() }
    );

    expect(queryByText('건강정보')).toBeNull();
    expect(queryByText('알 수 없어요')).toBeNull();
  });

  it('값이 있는 항목만 행으로 노출하고 미상 항목은 숨긴다', () => {
    const { getByText, queryByText } = render(
      <CommunityDetailHealthSection neuterYn="Y" vaccinationCheck="" healthCheck="" health="" />,
      { wrapper: createWrapper() }
    );

    expect(getByText('건강정보')).toBeTruthy();
    expect(getByText('중성화')).toBeTruthy();
    expect(queryByText('예방접종')).toBeNull();
    expect(queryByText('건강검진')).toBeNull();
  });

  it('건강 특이사항만 있어도 섹션을 렌더한다', () => {
    const { getByText } = render(
      <CommunityDetailHealthSection neuterYn="U" vaccinationCheck="" healthCheck="" health="물을 잘 안 마셔요" />,
      { wrapper: createWrapper() }
    );

    expect(getByText('건강정보')).toBeTruthy();
    expect(getByText('물을 잘 안 마셔요')).toBeTruthy();
  });
});
