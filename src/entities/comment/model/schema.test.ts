import { CommentSchema, CommentSortOrderSchema } from './schema';

const VALID_COMMENT = {
  id: 'c1',
  user: {
    id: 1,
    name: 'Lee',
    nickname: 'keeper',
    email: 'a@b.com',
    image: 'https://x'
  },
  likeCount: 0,
  content: '댓글',
  createdAt: '2026-05-04T00:00:00Z',
  likeByMe: false
};

describe('CommentSchema', () => {
  it('user 가 UserSchema 형태이고 모든 필드 채워지면 통과', () => {
    expect(() => CommentSchema.parse(VALID_COMMENT)).not.toThrow();
  });

  it('user 누락 시 실패', () => {
    const { user, ...rest } = VALID_COMMENT;
    expect(() => CommentSchema.parse(rest)).toThrow();
  });

  it('likeByMe 누락 시 실패', () => {
    const { likeByMe, ...rest } = VALID_COMMENT;
    expect(() => CommentSchema.parse(rest)).toThrow();
  });
});

describe('CommentSortOrderSchema', () => {
  it('LATEST / CREATED 만 통과', () => {
    expect(() => CommentSortOrderSchema.parse('LATEST')).not.toThrow();
    expect(() => CommentSortOrderSchema.parse('CREATED')).not.toThrow();
  });

  it('그 외 값 거부', () => {
    expect(() => CommentSortOrderSchema.parse('OLDEST')).toThrow();
  });
});
