import { styled, XStack } from 'tamagui';

import { Button, TextArea } from '@/shared';

export const CommentFormInput = () => {
  return (
    <Container>
      <TextArea placeholder="소중한 의견을 남겨주세요:)" />
      <Button color="secondary" size="small" style={{ minWidth: 72 }}>
        등록
      </Button>
    </Container>
  );
};

const Container = styled(XStack, {
  px: 16,
  py: 12,
  gap: 6,
  borderTopWidth: 1,
  borderTopColor: '$backgroundDefault'
});
