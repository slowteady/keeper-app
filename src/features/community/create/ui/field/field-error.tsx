import { styled, Text, TextProps } from 'tamagui';

// 폼 필드 inline 에러 메시지 — react-hook-form Controller fieldState.error.message 또는 직접 message string 노출
// 메시지 없으면 렌더 X (불필요한 공간 차지 방지)
export const FieldError = ({ message, ...props }: { message?: string } & TextProps) => {
  if (!message) return null;
  return <ErrorText {...props}>{message}</ErrorText>;
};

const ErrorText = styled(Text, {
  fontSize: 13,
  lineHeight: 18,
  color: '$errorMain',
  mt: 6,
  letterSpacing: -0.25
});
