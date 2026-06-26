import { useSuspenseQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Keyboard } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { ADOPT_FORM_FIELD_ORDER, CommunityAdoptFormDto, communityQueries } from '@/entities/community';
import { LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { QnaEditContent, useEditPost } from '@/features/community';
import { findFirstFieldError, globalToast } from '@/shared/lib';
import { useLayout } from '@/shared/model';
import { Button, CancelModal, DetailErrorBoundary, ModalPageHeader } from '@/shared/ui';
import { CommunityAdoptForm, PostDetailSkeleton } from '@/widgets/community-post-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;

  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <EditRouter postId={id} />
    </Suspense>
  );
};

const EditRouter = ({ postId }: { postId: string }) => {
  const { data } = useSuspenseQuery(communityQueries.detail(postId));
  if (data.kind === 'QNA') return <QnaEditContent postId={postId} />;
  return <EditContent postId={postId} />;
};

const EditContent = ({ postId }: { postId: string }) => {
  const { bottom } = useLayout();
  const [buttonHeight, setButtonHeight] = useState(0);

  const { form, isSubmitting, actions } = useEditPost(postId);

  const isDirty = form.formState.isDirty;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (isDirty && !isSubmitting) {
      setShowCancelModal(true);
    } else {
      router.back();
    }
  }, [isDirty, isSubmitting]);

  const handleConfirmExit = useCallback(() => {
    setShowCancelModal(false);
    router.back();
  }, []);

  const {
    ref: locationRef,
    searchedAddresses,
    isPending: isLocationPending,
    openBottomSheet,
    submitGeocode,
    getAddress,
    dismiss: dismissLocation
  } = useLocationBottomSheet((selectedAddress) => {
    form.setValue('location', selectedAddress.address.address_name, { shouldDirty: true });
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
      const trigger = selectTriggers[first.name];
      if (trigger) trigger();
      else form.setFocus(first.name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, actions, openBottomSheet]
  );

  return (
    <Container>
      <ModalPageHeader title="개인입양 수정하기" fullScreen onClose={handleClose} />
      <KeyboardAwareScrollView contentContainerStyle={{ paddingVertical: 40 }} bottomOffset={buttonHeight}>
        <CommunityAdoptForm
          form={form}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          onPressLocation={openBottomSheet}
        />
      </KeyboardAwareScrollView>

      <KeyboardStickyView
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setButtonHeight((prev) => (prev === h ? prev : h));
        }}
      >
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
