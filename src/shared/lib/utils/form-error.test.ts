import { getFormErrorMessage } from './form-error';

describe('getFormErrorMessage', () => {
  it('returns a direct field error message', () => {
    expect(getFormErrorMessage({ message: '제목을 입력해주세요' })).toBe('제목을 입력해주세요');
  });

  it('returns a nested field error message', () => {
    expect(getFormErrorMessage([{ value: { message: '연락처를 입력해주세요' } }])).toBe('연락처를 입력해주세요');
  });

  it('returns undefined when no message exists', () => {
    expect(getFormErrorMessage({ value: {} })).toBeUndefined();
  });
});
