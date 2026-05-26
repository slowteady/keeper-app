import {
  CheckNicknameBodySchema,
  LoginDataSchema,
  LoginParamsSchema,
  RefreshDataSchema,
  SignUpBodySchema,
  SocialLoginTypeSchema,
  UpdateMeBodySchema,
  UserSchema
} from './schema';

const VALID_USER = {
  id: 1,
  name: 'Lee',
  nickname: 'keeper',
  email: 'a@b.com',
  image: 'https://x',
  socialType: 'KAKAO' as const,
  createdAt: '2025-09-23T00:00:00.000Z'
};

describe('UserSchema', () => {
  it('필수 필드 모두 있으면 통과', () => {
    expect(() => UserSchema.parse(VALID_USER)).not.toThrow();
  });

  it('id 가 number 가 아니면 실패', () => {
    expect(() => UserSchema.parse({ ...VALID_USER, id: '1' })).toThrow();
  });

  it('image 가 누락되면 실패', () => {
    const { image, ...rest } = VALID_USER;
    expect(() => UserSchema.parse(rest)).toThrow();
  });
});

describe('SocialLoginTypeSchema', () => {
  it('GOOGLE/APPLE/KAKAO/NAVER 만 통과', () => {
    ['GOOGLE', 'APPLE', 'KAKAO', 'NAVER'].forEach((v) => {
      expect(() => SocialLoginTypeSchema.parse(v)).not.toThrow();
    });
  });

  it('그 외 값 거부', () => {
    expect(() => SocialLoginTypeSchema.parse('FACEBOOK')).toThrow();
  });
});

describe('LoginDataSchema', () => {
  it('User + socialId/accessToken/refreshToken/isNew 가 모두 있으면 통과', () => {
    expect(() =>
      LoginDataSchema.parse({
        ...VALID_USER,
        socialId: 's1',
        accessToken: 'a',
        refreshToken: 'r',
        isNew: false
      })
    ).not.toThrow();
  });

  it('isNew 누락 시 실패', () => {
    expect(() =>
      LoginDataSchema.parse({
        ...VALID_USER,
        socialId: 's1',
        accessToken: 'a',
        refreshToken: 'r'
      })
    ).toThrow();
  });
});

describe('RefreshDataSchema', () => {
  it('accessToken/refreshToken 통과', () => {
    expect(() => RefreshDataSchema.parse({ accessToken: 'a', refreshToken: 'r' })).not.toThrow();
  });
});

describe('LoginParamsSchema', () => {
  it('socialType + token 통과', () => {
    expect(() => LoginParamsSchema.parse({ socialType: 'GOOGLE', token: 't' })).not.toThrow();
  });

  it('잘못된 socialType 거부', () => {
    expect(() => LoginParamsSchema.parse({ socialType: 'X', token: 't' })).toThrow();
  });
});

describe('CheckNicknameBodySchema', () => {
  it('nickname 통과', () => {
    expect(() => CheckNicknameBodySchema.parse({ nickname: 'keeper' })).not.toThrow();
  });
});

describe('SignUpBodySchema', () => {
  it('약관 필드 포함 모든 필수 필드 통과', () => {
    expect(() =>
      SignUpBodySchema.parse({
        socialType: 'KAKAO',
        socialId: 's1',
        nickname: 'keeper',
        agreedTermsVersion: 'v1.0',
        agreedPrivacyVersion: 'v1.0',
        agreedAt: '2026-05-04T00:00:00Z'
      })
    ).not.toThrow();
  });

  it('agreedTermsVersion 누락 시 실패', () => {
    expect(() =>
      SignUpBodySchema.parse({
        socialType: 'KAKAO',
        socialId: 's1',
        nickname: 'keeper',
        agreedPrivacyVersion: 'v1.0',
        agreedAt: '2026-05-04T00:00:00Z'
      })
    ).toThrow();
  });
});

describe('UpdateMeBodySchema', () => {
  it('nickname/image 둘 다 optional 이라 빈 객체 통과', () => {
    expect(() => UpdateMeBodySchema.parse({})).not.toThrow();
  });

  it('nickname 만 있어도 통과', () => {
    expect(() => UpdateMeBodySchema.parse({ nickname: 'keeper' })).not.toThrow();
  });

  it('image 만 있어도 통과', () => {
    expect(() => UpdateMeBodySchema.parse({ image: 'https://x' })).not.toThrow();
  });

  it('nickname 이 string 아니면 거부', () => {
    expect(() => UpdateMeBodySchema.parse({ nickname: 123 })).toThrow();
  });
});
