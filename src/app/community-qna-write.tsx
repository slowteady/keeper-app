import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Keyboard, View as NativeView } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { CommunityQnaFormDto, QNA_FORM_FIELD_ORDER } from '@/entities/community';
import { CommunityQnaForm, useCreateQnaPost } from '@/features/community';
import { findFirstFieldError, globalToast, scrollToView } from '@/shared/lib';
import { BottomButton, CancelModal, ModalPageHeader } from '@/shared/ui';

const Page = () => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const animalTypeRef = useRef<React.ElementRef<typeof NativeView>>(null);
  const { form, onSubmit, isPending } = useCreateQnaPost();

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
      if (!first) return;
      if (first.name === 'animalType') {
        Keyboard.dismiss();
        scrollToView(scrollRef, animalTypeRef);
        return;
      }
      form.setFocus(first.name);
    },
    [form]
  );

  return (
    <Container>
      <ModalPageHeader title="글 작성하기" fullScreen onClose={handleClose} />
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: buttonHeight + 40 }}
        bottomOffset={buttonHeight}
      >
        <CommunityQnaForm form={form} animalTypeRef={animalTypeRef} />
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
        등록하기
      </BottomButton>

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          router.back();
        }}
        title="작성을 그만두시겠어요?"
        description="작성 중인 내용은 저장되지 않아요"
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
