import { CommentSchema, CommentSortOrderSchema } from './schema';

const VALID_COMMENT = {
  id: '1',
  user: {
    id: '1',
    nickname: 'keeper',
    image: 'https://x'
  },
  content: '댓글',
  displayTime: '2026-05-04T00:00:00Z'
};

describe('CommentSchema', () => {
  it('user 가 PostUserSummary 형태이고 모든 필드 채워지면 통과', () => {
    expect(() => CommentSchema.parse(VALID_COMMENT)).not.toThrow();
  });

  it('user 가 null 이면 통과 (탈퇴 유저)', () => {
    expect(() => CommentSchema.parse({ ...VALID_COMMENT, user: null })).not.toThrow();
  });

  it('content 누락 시 실패', () => {
    const { content, ...rest } = VALID_COMMENT;
    expect(() => CommentSchema.parse(rest)).toThrow();
  });
});

describe('CommentSortOrderSchema', () => {
  it('LATEST / OLDEST 만 통과', () => {
    expect(() => CommentSortOrderSchema.parse('LATEST')).not.toThrow();
    expect(() => CommentSortOrderSchema.parse('OLDEST')).not.toThrow();
  });

  it('그 외 값 거부', () => {
    expect(() => CommentSortOrderSchema.parse('CREATED')).toThrow();
  });
});
