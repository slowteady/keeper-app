import { z } from 'zod';

export const SocialLoginTypeSchema = z.enum(['GOOGLE', 'APPLE', 'KAKAO', 'NAVER']);
export type SocialLoginType = z.infer<typeof SocialLoginTypeSchema>;

export const UserSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  email: z.string(),
  image: z.string(),
  socialType: SocialLoginTypeSchema,
  createdAt: z.string().optional()
});
export type UserDto = z.infer<typeof UserSchema>;

// signupToken 응답(isNew=true) 도 같은 endpoint 라 id/nickname/accessToken/refreshToken 이 없을 수 있음.
export const LoginUserPartialSchema = z.object({
  id: z.string().optional(),
  nickname: z.string().nullable().optional(),
  email: z.string(),
  image: z.string(),
  socialType: SocialLoginTypeSchema
});

export const RefreshDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});
export type RefreshDataDto = z.infer<typeof RefreshDataSchema>;

export const LoginDataSchema = LoginUserPartialSchema.extend({
  socialId: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  signupToken: z.string().optional(),
  isNew: z.boolean()
});
export type LoginDataDto = z.infer<typeof LoginDataSchema>;

export const LoginParamsSchema = z.object({
  socialType: SocialLoginTypeSchema,
  token: z.string()
});
export type LoginParamsDto = z.infer<typeof LoginParamsSchema>;

export const CheckNicknameBodySchema = z.object({
  nickname: z.string()
});
export type CheckNicknameBodyDto = z.infer<typeof CheckNicknameBodySchema>;

export const UpdateMeBodySchema = z.object({
  nickname: z.string().optional(),
  image: z.string().optional()
});
export type UpdateMeBodyDto = z.infer<typeof UpdateMeBodySchema>;

export const WithdrawReasonSchema = z.enum([
  'ADOPTED',
  'PAUSE',
  'INFO_NOT_FOUND',
  'UX_ISSUE',
  'PRIVACY_CONCERN',
  'REJOIN_LATER',
  'OTHER'
]);
export type WithdrawReason = z.infer<typeof WithdrawReasonSchema>;

export const DeleteMeBodySchema = z.object({
  reason: WithdrawReasonSchema,
  reasonDetail: z.string().max(500).optional()
});
export type DeleteMeBodyDto = z.infer<typeof DeleteMeBodySchema>;
