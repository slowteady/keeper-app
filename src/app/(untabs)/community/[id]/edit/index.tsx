import { usePreventRemove } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { Spinner, styled, Text, View } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import { LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { useEditPost } from '@/features/community';
import { globalToast } from '@/shared/lib';
import { useLayout } from '@/shared/model';
import { Button, CancelModal } from '@/shared/ui';
import { CommunityAdoptForm } from '@/widgets/community-adopt-feed-section';

const FIELD_ORDER: (keyof CommunityAdoptFormDto)[] = [
  'animalType',
  'gender',
  'neuterYn',
  'healthCheck',
  'protectionType',
  'vaccinationCheck',
  'weight',
  'location',
  'age',
  'specificType',
  'title',
  'content',
  'specialMark',
  'contact',
  'images'
];

const findFirstError = (
  errors: FieldErrors<CommunityAdoptFormDto>
): { name: keyof CommunityAdoptFormDto; message: string } | null => {
  for (const name of FIELD_ORDER) {
    const err = errors[name] as { message?: string } | undefined;
    if (err?.message) return { name, message: err.message };
  }
  return null;
};

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const { bottom } = useLayout();
  const [buttonHeight, setButtonHeight] = useState(0);

  const { form, isLoading, isError, isSubmitting, actions } = useEditPost(postId);

  const isDirty = form.formState.isDirty;
  const [allowLeave, setAllowLeave] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingExit, setPendingExit] = useState(false);
  const showCancelModalRef = useRef(showCancelModal);
  useEffect(() => {
    showCancelModalRef.current = showCancelModal;
  }, [showCancelModal]);

  const prevent = isDirty && !isSubmitting && !allowLeave;
  usePreventRemove(prevent, () => {
    if (!showCancelModalRef.current) setShowCancelModal(true);
  });

  const handleConfirmExit = useCallback(() => {
    setShowCancelModal(false);
    setAllowLeave(true);
    setPendingExit(true);
  }, []);

  useEffect(() => {
    if (allowLeave && pendingExit) {
      router.back();
      setPendingExit(false);
    }
  }, [allowLeave, pendingExit]);

  const {
    ref: locationRef,
    searchedAddresses,
    isPending: isLocationPending,
    openBottomSheet,
    submitGeocode,
    getAddress,
    dismiss: dismissLocation
  } = useLocationBottomSheet((selectedAddress) => {
    form.setValue('location', selectedAddress.address.address_name);
  });

  const selectTriggers: Partial<Record<keyof CommunityAdoptFormDto, () => void>> = {
    weight: actions.openWeightSelector,
    age: actions.openAgeSelector,
    specificType: actions.openKindSelector,
    location: openBottomSheet
  };
  const onInvalid = useCallback(
    (errors: FieldErrors<CommunityAdoptFormDto>) => {
      const first = findFirstError(errors);
      globalToast(first?.message ?? '필수 항목을 입력해주세요', 'fail');
      if (!first) return;
      const trigger = selectTriggers[first.name];
      if (trigger) trigger();
      else form.setFocus(first.name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, actions, openBottomSheet]
  );

  if (isLoading) {
    return (
      <Container items="center" justify="center">
        <Spinner size="large" color="$primaryMain" />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container items="center" justify="center">
        <ErrorText>게시글을 불러오지 못했어요</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <KeyboardAwareScrollView contentContainerStyle={{ paddingVertical: 40 }} bottomOffset={buttonHeight}>
        <CommunityAdoptForm
          form={form}
          onPressWeight={actions.openWeightSelector}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          onPressLocation={openBottomSheet}
          readOnlyImages
          title="개인입양 홍보 수정"
        />
      </KeyboardAwareScrollView>

      <KeyboardStickyView onLayout={(e) => setButtonHeight(e.nativeEvent.layout.height)}>
        <StickyButtonWrapper pb={bottom}>
          <Button
            size="large"
            style={{ borderRadius: 10 }}
            onPress={form.handleSubmit(actions.handleSubmit, onInvalid)}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            수정하기
          </Button>
        </StickyButtonWrapper>
      </KeyboardStickyView>

      <LocationBottomSheet
        ref={locationRef}
        addresses={searchedAddresses || []}
        onDismiss={dismissLocation}
        onSearch={submitGeocode}
        onSelectAddress={getAddress}
        isPending={isLocationPending}
      />

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmExit}
        title="수정을 그만두시겠어요?"
        description="수정 중인 내용은 저장되지 않아요"
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const StickyButtonWrapper = styled(View, {
  px: 20,
  pt: 10,
  bg: '$white900'
});

const ErrorText = styled(Text, {
  color: '$black500',
  fontSize: 14
});
