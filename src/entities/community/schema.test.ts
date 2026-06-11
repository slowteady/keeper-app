import { CommunityAdoptFormSchema } from './schema';

// 폼 작성 schema 검증 — 특히 contact 배열의 chip + value 정합성 (옵션 A: 선택한 chip 의 value 모두 필수)
// 게시글 작성 흐름의 핵심 validation 이므로 엣지 케이스를 명시적으로 고정한다.
const baseValid = {
  title: '제목',
  animalType: 'DOG' as const,
  specificType: '말티즈',
  images: ['file://image1.jpg'],
  gender: 'M',
  neuterYn: 'Y' as const,
  healthCheck: 'Y' as const,
  age: '2023',
  weight: '5',
  location: '서울특별시 강남구',
  specialMark: '온순함',
  content: '소개글',
  protectionType: 'ADOPTION' as const,
  vaccinationCheck: 'THIRD' as const,
  contact: [{ type: 'PHONE' as const, value: '010-1234-5678' }]
};

describe('CommunityAdoptFormSchema', () => {
  describe('happy path', () => {
    it('필수값이 모두 채워지면 통과한다', () => {
      const result = CommunityAdoptFormSchema.safeParse(baseValid);
      expect(result.success).toBe(true);
    });
  });

  describe('contact (chip + value)', () => {
    it('chip 0개(연락처 미입력)여도 통과 — 연락처는 선택', () => {
      const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, contact: [] });
      expect(result.success).toBe(true);
    });

    it('chip 1개 + value 빈 문자열이면 item value 에러', () => {
      const result = CommunityAdoptFormSchema.safeParse({
        ...baseValid,
        contact: [{ type: 'PHONE', value: '' }]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === 'contact' && i.path[1] === 0 && i.path[2] === 'value'
        );
        expect(issue?.message).toBe('연락처를 입력해주세요');
      }
    });

    it('chip 1개 + value 공백만이면 trim 후 빈 — 에러', () => {
      const result = CommunityAdoptFormSchema.safeParse({
        ...baseValid,
        contact: [{ type: 'EMAIL', value: '   ' }]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === 'contact' && i.path[1] === 0 && i.path[2] === 'value'
        );
        expect(issue?.message).toBe('연락처를 입력해주세요');
      }
    });

    it('chip 2개 + 한 개만 빈 value면 해당 인덱스에만 에러', () => {
      const result = CommunityAdoptFormSchema.safeParse({
        ...baseValid,
        contact: [
          { type: 'PHONE', value: '010-1234-5678' },
          { type: 'EMAIL', value: '' }
        ]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues.filter((i) => i.path[0] === 'contact');
        expect(issues).toHaveLength(1);
        expect(issues[0].path[1]).toBe(1);
        expect(issues[0].path[2]).toBe('value');
      }
    });

    it('chip 3개(PHONE/EMAIL/SNS) + 모두 값 채움이면 통과', () => {
      const result = CommunityAdoptFormSchema.safeParse({
        ...baseValid,
        contact: [
          { type: 'PHONE', value: '010-1234-5678' },
          { type: 'EMAIL', value: 'a@b.co' },
          { type: 'SNS', value: '@kakao_id' }
        ]
      });
      expect(result.success).toBe(true);
    });

    it('알 수 없는 type 은 enum 에러', () => {
      const result = CommunityAdoptFormSchema.safeParse({
        ...baseValid,
        contact: [{ type: 'TEL' as 'PHONE', value: '010-1234-5678' }]
      });
      expect(result.success).toBe(false);
    });
  });

  describe('필수 string 필드', () => {
    // BP 검토 후 필수는 title/content 만 (나머지는 선택)
    it.each([
      ['title', ''],
      ['content', '']
    ] as const)('%s 가 빈 문자열이면 에러', (field, value) => {
      const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, [field]: value });
      expect(result.success).toBe(false);
    });
  });

  describe('선택 string 필드 (BP: 필수 6개로 축소)', () => {
    it.each(['specificType', 'age', 'weight', 'location', 'specialMark'] as const)(
      '%s 가 빈 문자열이어도 통과',
      (field) => {
        const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, [field]: '' });
        expect(result.success).toBe(true);
      }
    );

    it.each(['specificType', 'age', 'weight', 'location', 'specialMark'] as const)(
      '%s 가 undefined 여도 통과',
      (field) => {
        const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, [field]: undefined });
        expect(result.success).toBe(true);
      }
    );
  });

  describe('images', () => {
    it('images 배열이 비어있으면 "최소 1장의 이미지를 업로드해주세요"', () => {
      const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, images: [] });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === 'images');
        expect(issue?.message).toBe('최소 1장의 이미지를 업로드해주세요');
      }
    });

    it('images 가 한 장 이상이면 통과', () => {
      const result = CommunityAdoptFormSchema.safeParse({
        ...baseValid,
        images: ['file://1.jpg', 'file://2.jpg']
      });
      expect(result.success).toBe(true);
    });
  });

  describe('animalType / protectionType / vaccinationCheck enum', () => {
    it('animalType 은 DOG/CAT/OTHER 만 허용 (ETC 는 enum 위반)', () => {
      const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, animalType: 'ETC' as 'OTHER' });
      expect(result.success).toBe(false);
    });

    it('animalType OTHER 통과', () => {
      const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, animalType: 'OTHER' });
      expect(result.success).toBe(true);
    });

    it('protectionType TEMPORARY 통과', () => {
      const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, protectionType: 'TEMPORARY' });
      expect(result.success).toBe(true);
    });

    it('vaccinationCheck NONE 통과', () => {
      const result = CommunityAdoptFormSchema.safeParse({ ...baseValid, vaccinationCheck: 'NONE' });
      expect(result.success).toBe(true);
    });
  });

  describe('선택 입력 필드', () => {
    it('likes/dislikes/health/relatedLink 가 모두 비어 있어도 통과', () => {
      const result = CommunityAdoptFormSchema.safeParse({
        ...baseValid,
        likes: '',
        dislikes: '',
        health: '',
        relatedLink: ''
      });
      expect(result.success).toBe(true);
    });

    it('likes/dislikes/health/relatedLink 가 undefined 여도 통과', () => {
      // baseValid 자체에 선택 필드가 없으므로 그대로 parse 시 옵셔널 검증
      const result = CommunityAdoptFormSchema.safeParse(baseValid);
      expect(result.success).toBe(true);
    });
  });
});
