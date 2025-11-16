import { styled, XStack } from 'tamagui';

import { Button, TextArea } from '@/shared';

export const CommentFormInput = () => {
  return (
    <Container>
      <TextArea placeholder="소중한 의견을 남겨주세요:)" />
      <Button color="secondary" style={{ minWidth: 60, minHeight: 48 }}>
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
