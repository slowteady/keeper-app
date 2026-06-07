import { render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { TextArea } from './text-area';

describe('TextArea', () => {
  it('멀티라인 입력을 플랫폼과 무관하게 상단 정렬한다', () => {
    const { getByPlaceholderText } = render(<TextArea placeholder="소개글" />, {
      wrapper: createWrapper()
    });

    expect(getByPlaceholderText('소개글')).toHaveProp('textAlignVertical', 'top');
  });
});
