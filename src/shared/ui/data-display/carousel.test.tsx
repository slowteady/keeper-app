import { render } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { Carousel } from './carousel';

describe('Carousel', () => {
  it('같은 이미지가 여러 장이어도 중복 key 경고 없이 렌더한다', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const same = 'https://cdn/a.jpg';

    render(<Carousel data={[same, same, same]} />, { wrapper: createWrapper() });

    const duplicateKeyWarning = errorSpy.mock.calls.find((args) => String(args[0]).includes('same key'));
    expect(duplicateKeyWarning).toBeUndefined();

    errorSpy.mockRestore();
  });
});
