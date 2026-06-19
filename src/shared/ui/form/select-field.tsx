import { Pressable } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { DownArrow } from '@/shared/ui/icons/mini';

// TextField 와 동일한 외형, 동작은 onPress 트리거(BS 등) 전용.
// 사용자가 직접 입력하지 않고 옵션 선택만 받는 필드용.
// disabled+onPress 트릭 대신 명시적인 select 컴포넌트로 의도 분리.
export type SelectFieldProps = {
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  status?: 'default' | 'error';
  variant?: 'default' | 'fill';
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export const SelectField = ({
  value,
  placeholder,
  onPress,
  status = 'default',
  variant = 'fill',
  left,
  right
}: SelectFieldProps) => {
  const { black500 } = useTheme();
  const hasValue = !!value;

  return (
    <Pressable onPress={onPress}>
      <Container variant={variant} status={status}>
        {left ? <SideWrapper>{left}</SideWrapper> : null}
        <ValueText hasValue={hasValue}>{hasValue ? value : placeholder}</ValueText>
        <SideWrapper>{right ?? <DownArrow width={10} height={6} color={black500.val} />}</SideWrapper>
      </Container>
    </Pressable>
  );
};

const Container = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  rounded: '$3',
  height: 48,
  px: '$4',
  variants: {
    variant: {
      default: { bg: '$white900' },
      fill: { bg: '$white850' }
    },
    status: {
      default: {},
      error: {}
    }
  } as const,
  defaultVariants: {
    variant: 'fill',
    status: 'default'
  }
});

const ValueText = styled(Text, {
  flex: 1,
  fontSize: 15,
  variants: {
    hasValue: {
      true: { color: '$black900', fontWeight: 500 },
      false: { color: '$black500', fontWeight: 400 }
    }
  } as const
});

const SideWrapper = styled(XStack, {
  items: 'center',
  gap: '$2',
  pl: '$2'
});
