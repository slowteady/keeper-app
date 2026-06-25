import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { CommunityQnaFormDto, QNA_FORM_FIELD_ORDER } from '@/entities/community';
import { findFirstFieldError, globalToast } from '@/shared/lib';
import { BottomButton, CancelModal, ModalPageHeader } from '@/shared/ui';

import { useUpdateQnaPost } from '../model/use-update-qna-post';
import { CommunityQnaForm } from './community-qna-form';

export const QnaEditContent = ({ postId }: { postId: string }) => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const { form, onSubmit, isPending } = useUpdateQnaPost(postId);

  const isDirty = form.formState.isDirty;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (isDirty && !isPending) setShowCancelModal(true);
    else router.back();
  }, [isDirty, isPending]);

  const onInvalid = useCallback(
    (errors: FieldErrors<CommunityQnaFormDto>) => {
      const first = findFirstFieldError(errors, QNA_FORM_FIELD_ORDER);
      globalToast(first?.message ?? '필수 항목을 입력해주세요', 'fail');
      if (first) form.setFocus(first.name);
    },
    [form]
  );

  return (
    <Container>
      <ModalPageHeader title="궁금해요 수정하기" fullScreen onClose={handleClose} />
      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingTop: 40, paddingBottom: buttonHeight + 40 }}
        bottomOffset={buttonHeight}
      >
        <CommunityQnaForm form={form} />
      </KeyboardAwareScrollView>

      <BottomButton
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setButtonHeight((prev) => (prev === h ? prev : h));
        }}
        onPress={form.handleSubmit(() => onSubmit(), onInvalid)}
        disabled={isPending}
        isLoading={isPending}
      >
        수정하기
      </BottomButton>

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          router.back();
        }}
        title="수정을 그만두시겠어요?"
        description="수정 중인 내용은 저장되지 않아요"
      />
    </Container>
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
