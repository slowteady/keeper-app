import { patchCommentCountCache } from './patch-comment-count';

describe('patchCommentCountCache', () => {
  it('무한 리스트에서 해당 post 의 comment 카운트를 delta 만큼 증감', () => {
    const data = {
      pages: [
        {
          items: [
            { id: 'a', counts: { comment: 2, like: 0 } },
            { id: 'b', counts: { comment: 5, like: 0 } }
          ]
        }
      ],
      pageParams: [null]
    };
    const next = patchCommentCountCache(data, 'a', 1);
    expect(next.pages[0].items[0].counts.comment).toBe(3);
    expect(next.pages[0].items[1].counts.comment).toBe(5);
  });

  it('detail union(QNA) 의 comment 카운트 증감', () => {
    const data = { kind: 'QNA' as const, qna: { id: 'a', counts: { comment: 2 } } };
    expect(patchCommentCountCache(data, 'a', -1).qna.counts.comment).toBe(1);
  });

  it('detail union(ADOPT) 의 comment 카운트 증감', () => {
    const data = { kind: 'ADOPT' as const, adopt: { id: 'a', counts: { comment: 2 } } };
    expect(patchCommentCountCache(data, 'a', 1).adopt.counts.comment).toBe(3);
  });

  it('0 미만으로 내려가지 않음', () => {
    const data = { kind: 'QNA' as const, qna: { id: 'a', counts: { comment: 0 } } };
    expect(patchCommentCountCache(data, 'a', -1).qna.counts.comment).toBe(0);
  });

  it('대상 id 가 아니면 동일 참조 반환', () => {
    const data = { kind: 'QNA' as const, qna: { id: 'a', counts: { comment: 2 } } };
    expect(patchCommentCountCache(data, 'x', 1)).toBe(data);
  });
});
