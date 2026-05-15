import { Pressable } from 'react-native';
import { styled, Text, TextAreaProps, View, XStack } from 'tamagui';

import { Button, TextArea } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

export type CommentFormBanner = {
  label: string;
  onCancel: () => void;
};

export type CommentFormInputProps = Omit<TextAreaProps, 'onSubmitEditing'> & {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  // 작성 외 모드(수정/답글) 시 상단 안내 바 + 취소 핸들러
  banner?: CommentFormBanner;
  submitLabel?: string;
};

export const CommentFormInput = ({
  value,
  onChangeText,
  onSubmit,
  isPending = false,
  banner,
  submitLabel = '등록',
  ...rest
}: CommentFormInputProps) => {
  const canSubmit = value.trim().length > 0 && !isPending;

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
        <View mr={8}>
          <AnimatedHeart size={28} />
        </View>

        <View flex={1} mr={6}>
          <TextArea placeholder="소중한 의견을 남겨주세요:)" value={value} onChangeText={onChangeText} {...rest} />
        </View>

        <Button color="secondary" size="small" style={{ minWidth: 72 }} disabled={!canSubmit} onPress={onSubmit}>
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
  pt: 8,
  pb: 4,
  items: 'center',
  justify: 'space-between',
  bg: '$white850'
});

const BannerText = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500'
});

const CancelText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  color: '$primaryMain'
});
