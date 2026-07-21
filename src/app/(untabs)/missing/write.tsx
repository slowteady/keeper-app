import { useCallback, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Keyboard, TextInput, View as NativeView } from 'react-native';
import { KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { MISSING_FORM_FIELD_ORDER, MissingCreateFormDto } from '@/entities/missing';
import { LocationBottomSheet } from '@/features/address';
import { useCreateMissing } from '@/features/missing';
import { findFirstFieldError, globalToast, safeBack, scrollToView } from '@/shared/lib';
import { BottomButton, CancelModal, FormLayout, ModalPageHeader } from '@/shared/ui';
import { MissingForm } from '@/widgets/missing-section';

const Page = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const imagesRef = useRef<React.ElementRef<typeof NativeView>>(null);
  const contactInputRef = useRef<TextInput>(null);
  const contactOffsetRef = useRef(0);

  const { form, location, isSubmitting, actions } = useCreateMissing();
  const isDirty = form.formState.isDirty;

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (isDirty && !isSubmitting) {
      setShowCancelModal(true);
    } else {
      safeBack('/(untabs)/missing');
    }
  }, [isDirty, isSubmitting]);

  const handleConfirmExit = useCallback(() => {
    setShowCancelModal(false);
    safeBack('/(untabs)/missing');
  }, []);

  const onInvalid = useCallback(
    (errors: FieldErrors<MissingCreateFormDto>) => {
      const first = findFirstFieldError(errors, MISSING_FORM_FIELD_ORDER);
      globalToast(first?.message ?? '필수 항목을 입력해주세요', 'fail');
      if (!first) return;

      if (first.name === 'contact') {
        Keyboard.dismiss();
        scrollRef.current?.scrollTo({ y: Math.max(contactOffsetRef.current - 20, 0), animated: true });
        requestAnimationFrame(() => contactInputRef.current?.focus());
        return;
      }
      if (first.name === 'images') {
        Keyboard.dismiss();
        scrollToView(scrollRef, imagesRef);
        return;
      }
      if (first.name === 'address' || first.name === 'lat' || first.name === 'lng') {
        Keyboard.dismiss();
        location.openBottomSheet();
        return;
      }
      if (first.name === 'age') {
        actions.openAgeSelector();
        return;
      }
      if (first.name === 'specificType') {
        actions.openKindSelector();
        return;
      }
      form.setFocus(first.name);
    },
    [form, actions, location]
  );

  return (
    <Container>
      <ModalPageHeader title="실종 신고하기" fullScreen onClose={handleClose} />

      <FormLayout
        scrollRef={scrollRef}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        footer={
          <BottomButton
            onPress={form.handleSubmit(actions.handleSubmit, onInvalid)}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            등록하기
          </BottomButton>
        }
      >
        <MissingForm
          form={form}
          onPressLocation={location.openBottomSheet}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          fieldRefs={{ images: imagesRef, contactInput: contactInputRef }}
          onContactLayout={(event) => {
            contactOffsetRef.current = event.nativeEvent.layout.y;
          }}
        />
      </FormLayout>

      <LocationBottomSheet
        ref={location.ref}
        results={location.results}
        query={location.keyword}
        onChangeText={location.setKeyword}
        onDismiss={location.dismiss}
        onSelectAddress={location.getAddress}
        isPending={location.isPending}
        isFetchingNextPage={location.isFetchingNextPage}
        hasNextPage={location.hasNextPage}
        fetchNextPage={location.fetchNextPage}
      />

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmExit}
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
