import { usePreventRemove } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import { LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { useCreatePost } from '@/features/community';
import { globalToast } from '@/shared/lib';
import { BottomButton, CancelModal } from '@/shared/ui';
import { CommunityAdoptForm } from '@/widgets/community-adopt-feed-section';

// react-hook-form errors 의 키 순서가 zod schema 정의 순서와 다를 수 있어,
// 폼 시각적 순서에 맞춰 첫 에러 필드를 결정한다 (참조: CommunityAdoptForm 의 렌더 순서)
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
  const [buttonHeight, setButtonHeight] = useState(0);

  // 약관 동의 게이트는 진입점(community/_layout)에서 처리 — 이 페이지는 동의 후만 진입
  const { form, isSubmitting, actions } = useCreatePost();

  // 작성 중 이탈 방지 — form dirty 상태에서 뒤로가기 / 홈 / 스와이프 시 모달 노출
  // submit 중이거나 이탈 허용 후엔 통과 (회원가입 패턴과 동일)
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

  // allowLeave 가 반영된 다음 렌더에서 router.back — usePreventRemove 가 다시 가로채지 않음
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

  // 폼 검증 실패 시:
  // - 첫 에러 메시지를 토스트로 알림 (inline 메시지는 각 필드에 노출됨)
  // - select 필드(weight/location/age/specificType)는 해당 BS 를 자동 오픈 — 사용자가 즉시 선택 가능
  // - focusable 필드(textarea 등)는 setFocus → KeyboardAwareScrollView 가 자동 스크롤
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

  return (
    <Container>
      <KeyboardAwareScrollView contentContainerStyle={{ paddingVertical: 40 }} bottomOffset={buttonHeight}>
        <CommunityAdoptForm
          form={form}
          onPressWeight={actions.openWeightSelector}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          onPressLocation={openBottomSheet}
        />
      </KeyboardAwareScrollView>

      <BottomButton
        onLayout={(e) => setButtonHeight(e.nativeEvent.layout.height)}
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
