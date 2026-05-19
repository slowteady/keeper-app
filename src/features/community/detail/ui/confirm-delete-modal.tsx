import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

export type ConfirmDeleteModalProps = {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Figma node-id=794-9352 매핑.
// 게시글/댓글 등 "내 콘텐츠 삭제" 흐름 공용 — description 미지정 시 게시글 기본 문구 노출.
export const ConfirmDeleteModal = ({
  title = '정말 게시물을 삭제할까요?',
  description = '*내가 쓴 글이 완전히 삭제됩니다.',
  onConfirm,
  onCancel
}: ConfirmDeleteModalProps) => {
  return (
    <Container>
      <Content>
        <YStack gap={12}>
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
        </YStack>

        <Actions>
          <Pressable style={styles.secondaryButton} onPress={onCancel}>
            <ButtonText>닫기</ButtonText>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={onConfirm}>
            <PrimaryButtonText>삭제하기</PrimaryButtonText>
          </Pressable>
        </Actions>
      </Content>
    </Container>
  );
};

// 다른 모달 (CallModal 등) 과 크기/모서리 통일 — 같은 시각 위계.
const Container = styled(View, {
  width: '80%',
  rounded: 18,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16
});

const Content = styled(YStack, {
  gap: 32
});

const Title = styled(Text, {
  fontSize: 17,
  fontWeight: '600',
  lineHeight: 24,
  letterSpacing: -0.34,
  color: '#222423',
  pt: 4
});

const Description = styled(Text, {
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 21,
  letterSpacing: -0.28,
  color: '#ADB3AF'
});

const Actions = styled(XStack, {
  gap: 6,
  self: 'stretch'
});

const styles = StyleSheet.create({
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9ECEA'
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4C47'
  }
});

const ButtonText = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 14,
  color: '#222423'
});

const PrimaryButtonText = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 14,
  color: '#FFFFFF'
});
