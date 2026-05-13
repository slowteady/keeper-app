import { styled, TextAreaProps, View, XStack } from 'tamagui';

import { Button, TextArea } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

export type CommentFormInputProps = Omit<TextAreaProps, 'onSubmitEditing'> & {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
};

export const CommentFormInput = ({
  value,
  onChangeText,
  onSubmit,
  isPending = false,
  ...rest
}: CommentFormInputProps) => {
  const canSubmit = value.trim().length > 0 && !isPending;

  return (
    <Container>
      <View mr={8}>
        <AnimatedHeart size={28} />
      </View>

      <View flex={1} mr={6}>
        <TextArea placeholder="소중한 의견을 남겨주세요:)" value={value} onChangeText={onChangeText} {...rest} />
      </View>

      <Button color="secondary" size="small" style={{ minWidth: 72 }} disabled={!canSubmit} onPress={onSubmit}>
        등록
      </Button>
    </Container>
  );
};

const Container = styled(XStack, {
  px: 16,
  py: 12,
  borderTopWidth: 1,
  borderTopColor: '$backgroundDefault',
  items: 'center'
});
