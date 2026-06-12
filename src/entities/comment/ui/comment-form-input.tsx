import { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, TextAreaProps, View, XStack } from 'tamagui';

import { Button, TextArea } from '@/shared/ui';

export type CommentFormBanner = {
  label: string;
  onCancel: () => void;
};

export type CommentFormInputProps = Omit<TextAreaProps, 'onSubmitEditing'> & {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  banner?: CommentFormBanner;
  submitLabel?: string;
  disabled?: boolean;
  onTapWhenDisabled?: () => void;
  leading?: ReactNode;
};

// 게시글 좋아요는 헤더 하트만 — 입력창에 좋아요 둘 필요 X (Instagram/Threads/29cm 표준).
export const CommentFormInput = ({
  value,
  onChangeText,
  onSubmit,
  isPending = false,
  banner,
  submitLabel = '등록',
  disabled = false,
  onTapWhenDisabled,
  leading,
  ...rest
}: CommentFormInputProps) => {
  const canSubmit = value.trim().length > 0 && !isPending && !disabled;

  return (
    <Container>
      {banner && (
        <BannerRow>
          <BannerText>{banner.label}</BannerText>
          <Pressable onPress={banner.onCancel} hitSlop={10}>
            <CancelText>취소</CancelText>
          </Pressable>
        </BannerRow>
      )}
      <InputRow>
        {leading && <View mr={8}>{leading}</View>}
        <View flex={1} mr={6} position="relative">
          <TextArea
            placeholder="소중한 의견을 남겨주세요:)"
            value={value}
            onChangeText={onChangeText}
            testID="comment-input"
            {...rest}
          />
          {disabled && (
            <Pressable style={StyleSheet.absoluteFill} onPress={onTapWhenDisabled} testID="comment-input-guard" />
          )}
        </View>

        <Button
          color="secondary"
          size="small"
          style={{ minWidth: 72 }}
          disabled={!canSubmit}
          onPress={disabled ? onTapWhenDisabled : onSubmit}
          testID="comment-submit"
        >
          {submitLabel}
        </Button>
      </InputRow>
    </Container>
  );
};

const Container = styled(View, {
  borderTopWidth: 1,
  borderTopColor: '$backgroundDefault'
});

const InputRow = styled(XStack, {
  px: 16,
  py: 12,
  items: 'center'
});

const BannerRow = styled(XStack, {
  px: 16,
  py: 10,
  items: 'center',
  justify: 'space-between',
  bg: '$white850'
});

const BannerText = styled(Text, {
  fontSize: 13,
  fontWeight: '500',
  color: '$black500',
  lineHeight: 18
});

const CancelText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  color: '$primaryMain',
  lineHeight: 18
});
