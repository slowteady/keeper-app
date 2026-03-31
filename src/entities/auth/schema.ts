import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  nickname: z.string(),
  email: z.string(),
  image: z.string()
});
export type UserDto = z.infer<typeof UserSchema>;

export const RefreshDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});
export type RefreshDataDto = z.infer<typeof RefreshDataSchema>;

export const LoginDataSchema = UserSchema.extend({
  socialId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  isNew: z.boolean()
});
export type LoginDataDto = z.infer<typeof LoginDataSchema>;

export const SocialLoginTypeSchema = z.enum(['GOOGLE', 'APPLE', 'KAKAO', 'NAVER']);
export type SocialLoginType = z.infer<typeof SocialLoginTypeSchema>;

export const LoginParamsSchema = z.object({
  socialType: SocialLoginTypeSchema,
  token: z.string()
});
export type LoginParamsDto = z.infer<typeof LoginParamsSchema>;

export const CheckNicknameBodySchema = z.object({
  nickname: z.string()
});
export type CheckNicknameBodyDto = z.infer<typeof CheckNicknameBodySchema>;

export const SignUpBodySchema = z.object({
  socialType: SocialLoginTypeSchema,
  socialId: z.string(),
  nickname: z.string()
});
export type SignUpBodyDto = z.infer<typeof SignUpBodySchema>;
