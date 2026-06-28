import { canAddImage, canRemoveImage } from './image-selector';

describe('canAddImage — 추가 버튼 노출 여부', () => {
  it('readOnly 면 false', () => {
    expect(canAddImage({ readOnly: true, count: 0, max: 10 })).toBe(false);
  });

  it('count 가 max 미만이면 true', () => {
    expect(canAddImage({ readOnly: false, count: 3, max: 10 })).toBe(true);
  });

  it('count 가 max 와 같으면 false (한도 도달)', () => {
    expect(canAddImage({ readOnly: false, count: 10, max: 10 })).toBe(false);
  });

  it('count 가 max 를 초과하면 false (방어적)', () => {
    expect(canAddImage({ readOnly: false, count: 11, max: 10 })).toBe(false);
  });
});

describe('canRemoveImage — 삭제 버튼 노출 여부', () => {
  it('readOnly 면 false', () => {
    expect(canRemoveImage({ readOnly: true })).toBe(false);
  });

  it('readOnly 가 아니면 true (이미지가 있으면 항상 제거 가능)', () => {
    expect(canRemoveImage({ readOnly: false })).toBe(true);
  });
});
