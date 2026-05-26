import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import { LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { useCreatePost } from '@/features/community';
import { globalToast } from '@/shared/lib';
import { BottomButton, CancelModal, ModalPageHeader } from '@/shared/ui';
import { CommunityAdoptForm } from '@/widgets/community-adopt-feed-section';

// 폼 시각적 순서에 맞춰 첫 에러 필드를 결정 (CommunityAdoptForm 렌더 순서)
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
  const [buttonHeight, setButtonHeight] = useState(0);

  // 약관 동의 게이트는 진입점(community/_layout)에서 처리 — 이 페이지는 동의 후만 진입
  const { form, isSubmitting, actions } = useCreatePost();

  // X 버튼 → dirty 면 CancelModal, 아니면 즉시 닫기 (회원가입 패턴과 동일)
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

  // 폼 검증 실패 시:
  // - 첫 에러 메시지를 토스트로 알림 (inline 메시지는 각 필드에 노출됨)
  // - select 필드(weight/location/age/specificType)는 해당 BS 를 자동 오픈 — 사용자가 즉시 선택 가능
  // - focusable 필드(textarea 등)는 setFocus → KeyboardAwareScrollView 가 자동 스크롤
  // 필수 필드만 검증 실패하므로 select trigger 는 사용되지 않지만 (선택 필드는 검증 미발생),
  // edit / 추후 필수 전환 대비 유지
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
      <ModalPageHeader title="개인입양 홍보" fullScreen onClose={handleClose} />
      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingTop: 40, paddingBottom: buttonHeight + 40 }}
        bottomOffset={buttonHeight}
      >
        <CommunityAdoptForm
          form={form}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          onPressLocation={openBottomSheet}
        />
      </KeyboardAwareScrollView>

      <BottomButton
        // 동일 height 면 setState skip — onLayout 재호출 시 React commit 이 Reanimated
        // frame 을 차단해 KeyboardStickyView animation 이 간헐적으로 skip 되는 이슈 방지
        // (kirillzyusko/react-native-keyboard-controller#1306)
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
