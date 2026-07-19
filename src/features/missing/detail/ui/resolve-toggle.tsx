import { Pressable } from 'react-native';
import { styled, Text } from 'tamagui';

import { ConfirmModal, useModal } from '@/shared/ui';

import { useResolveMissing } from '../model/use-resolve-missing';

type Props = {
  id: string;
  isResolved: boolean;
};

export const ResolveToggle = ({ id, isResolved }: Props) => {
  const { resolve, isResolving } = useResolveMissing(id, isResolved);
  const { open, close } = useModal();

  // CancelModal 은 부모 기준 absoluteFill 이라 리스트 헤더 안에서 잘린다.
  // provider 모달을 써야 화면 최상위에 뜬다.
  const confirm = () => {
    open(
      <ConfirmModal
        title={isResolved ? '실종중으로 변경할까요?' : '찾음으로 변경할까요?'}
        description={
          isResolved
            ? '공고가 다시 노출돼요. 언제든 변경할 수 있어요'
            : '공고가 찾음으로 처리돼요. 다시 변경할 수 있어요'
        }
        confirmText="변경"
        cancelText="취소"
        onCancel={close}
        onConfirm={() => {
          close();
          resolve();
        }}
      />
    );
  };

  return (
    <Pressable onPress={confirm} disabled={isResolving} hitSlop={10} accessibilityRole="button">
      <Label>{isResolved ? '되돌리기' : '가족을 찾았어요'}</Label>
    </Pressable>
  );
};

const Label = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 20,
  color: '$black600',
  textDecorationLine: 'underline'
});
