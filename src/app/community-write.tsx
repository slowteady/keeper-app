import { useCallback, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Keyboard, TextInput, View as NativeView } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { ADOPT_FORM_FIELD_ORDER, CommunityAdoptFormDto } from '@/entities/community';
import { LocationBottomSheet, resolveRegionFromPlace, useLocationBottomSheet } from '@/features/address';
import { useCreatePost } from '@/features/community';
import { findFirstFieldError, globalToast, safeBack, scrollToView } from '@/shared/lib';
import { BottomButton, CancelModal, ModalPageHeader } from '@/shared/ui';
import { CommunityAdoptForm } from '@/widgets/community-post-section';

const Page = () => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const imagesRef = useRef<React.ElementRef<typeof NativeView>>(null);
  const contactInputRef = useRef<TextInput>(null);
  const contactOffsetRef = useRef(0);

  const { form, isSubmitting, actions } = useCreatePost();

  const isDirty = form.formState.isDirty;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (isDirty && !isSubmitting) {
      setShowCancelModal(true);
    } else {
      safeBack('/(tabs)/adopt');
    }
  }, [isDirty, isSubmitting]);

  const handleConfirmExit = useCallback(() => {
    setShowCancelModal(false);
    safeBack('/(tabs)/adopt');
  }, []);

  const {
    ref: locationRef,
    results: locationResults,
    isPending: isLocationPending,
    isFetchingNextPage: isLocationFetchingNextPage,
    hasNextPage: locationHasNextPage,
    fetchNextPage: fetchLocationNextPage,
    openBottomSheet,
    keyword: locationKeyword,
    setKeyword: setLocationKeyword,
    getAddress,
    dismiss: dismissLocation
  } = useLocationBottomSheet((selected) => {
    void resolveRegionFromPlace(selected).then(({ location, regionCode }) => {
      form.setValue('location', location, { shouldDirty: true });
      if (regionCode) form.setValue('regionCode', regionCode, { shouldDirty: true });
    });
  });

  const selectTriggers: Partial<Record<keyof CommunityAdoptFormDto, () => void>> = {
    age: actions.openAgeSelector,
    specificType: actions.openKindSelector,
    location: openBottomSheet
  };
  const onInvalid = useCallback(
    (errors: FieldErrors<CommunityAdoptFormDto>) => {
      const first = findFirstFieldError(errors, ADOPT_FORM_FIELD_ORDER);
      globalToast(first?.message ?? '필수 항목을 입력해주세요', 'fail');
      if (!first) return;
      if (first.name === 'contact') {
        Keyboard.dismiss();
        scrollRef.current?.scrollTo({ y: Math.max(contactOffsetRef.current - 20, 0), animated: true });
        requestAnimationFrame(() => contactInputRef.current?.focus());
        return;
      }
      const fieldRefs: Partial<Record<keyof CommunityAdoptFormDto, typeof imagesRef>> = {
        images: imagesRef
      };
      const fieldRef = fieldRefs[first.name];
      if (fieldRef) {
        Keyboard.dismiss();
        scrollToView(scrollRef, fieldRef);
        return;
      }
      const trigger = selectTriggers[first.name];
      if (trigger) trigger();
      else form.setFocus(first.name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, actions, openBottomSheet]
  );

  return (
    <Container>
      <ModalPageHeader title="개인입양 작성하기" fullScreen onClose={handleClose} />
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: buttonHeight + 40 }}
        bottomOffset={buttonHeight}
      >
        <CommunityAdoptForm
          form={form}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          onPressLocation={openBottomSheet}
          fieldRefs={{ images: imagesRef, contactInput: contactInputRef }}
          onContactLayout={(event) => {
            contactOffsetRef.current = event.nativeEvent.layout.y;
          }}
        />
      </KeyboardAwareScrollView>

      <BottomButton
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setButtonHeight((prev) => (prev === h ? prev : h));
        }}
        onPress={form.handleSubmit(actions.handleSubmit, onInvalid)}
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        등록하기
      </BottomButton>

      <LocationBottomSheet
        ref={locationRef}
        results={locationResults}
        query={locationKeyword}
        onChangeText={setLocationKeyword}
        onDismiss={dismissLocation}
        onSelectAddress={getAddress}
        isPending={isLocationPending}
        isFetchingNextPage={isLocationFetchingNextPage}
        hasNextPage={locationHasNextPage}
        fetchNextPage={fetchLocationNextPage}
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
