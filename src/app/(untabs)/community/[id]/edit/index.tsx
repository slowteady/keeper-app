import { useSuspenseQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Keyboard } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { CommunityAdoptFormDto, communityQueries } from '@/entities/community';
import { LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { QnaEditContent, useEditPost } from '@/features/community';
import { globalToast } from '@/shared/lib';
import { useLayout } from '@/shared/model';
import { Button, CancelModal, DetailErrorBoundary, ModalPageHeader } from '@/shared/ui';
import { CommunityAdoptForm, PostDetailSkeleton } from '@/widgets/community-adopt-feed-section';

export const ErrorBoundary = DetailErrorBoundary;

// write/index.tsx 와 동일 — CommunityAdoptForm 렌더 순서 따름 (필수 6개)
const FIELD_ORDER: (keyof CommunityAdoptFormDto)[] = [
  'images',
  'protectionType',
  'title',
  'content',
  'animalType',
  'contact'
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
  if (!postId) return null;

  // useSuspenseQuery 가 detail 도착까지 fallback (PostDetailSkeleton) 으로 가림 →
  // EditContent mount 시점에 detail 동기 prefill, default 값 노출 0.
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <EditRouter postId={postId} />
    </Suspense>
  );
};

// 응답 category 로 분기 — QNA 는 QnaEditContent, 그 외는 개인입양 수정.
// detail 과 같은 queryKey(communityQueries.detail) 라 캐시 hit (네트워크 1 회).
const EditRouter = ({ postId }: { postId: number }) => {
  const { data } = useSuspenseQuery(communityQueries.detail(postId));
  if (data.kind === 'QNA') return <QnaEditContent postId={postId} />;
  return <EditContent postId={postId} />;
};

const EditContent = ({ postId }: { postId: number }) => {
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

  return (
    <Container>
      <ModalPageHeader title="개인입양 글 수정" fullScreen onClose={handleClose} />
      <KeyboardAwareScrollView contentContainerStyle={{ paddingVertical: 40 }} bottomOffset={buttonHeight}>
        <CommunityAdoptForm
          form={form}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          onPressLocation={openBottomSheet}
          readOnlyImages
        />
      </KeyboardAwareScrollView>

      <KeyboardStickyView
        // 동일 height 면 setState skip — kirillzyusko/react-native-keyboard-controller#1306
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
