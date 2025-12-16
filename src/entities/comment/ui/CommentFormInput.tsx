import { styled, TextAreaProps, View, XStack } from 'tamagui';

import { Button, TextArea } from '@/shared';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

export const CommentFormInput = ({ ...props }: TextAreaProps) => {
  return (
    <Container>
      <View mr={8}>
        <AnimatedHeart size={28} onPress={() => {}} />
      </View>

      <View flex={1} mr={6}>
        <TextArea placeholder="소중한 의견을 남겨주세요:)" {...props} />
      </View>

      <Button color="secondary" size="small" style={{ minWidth: 72 }}>
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
