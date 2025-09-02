import { useCallback, useMemo, useState } from 'react';
import { Button, ButtonProps, styled, Text, useTheme, View, XStack } from 'tamagui';

export interface ChipButtonProps extends ButtonProps {
  selected?: boolean;
  defaultSelected?: boolean;
  toggleOnPress?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
}
export const ChipButton = ({
  children,
  selected,
  defaultSelected = false,
  toggleOnPress = false,
  left,
  right,
  onPress,
  ...props
}: ChipButtonProps) => {
  const [innerSelected, setInnerSelected] = useState(defaultSelected);
  const { primaryMain, white600, white800, black700 } = useTheme();

  const handlePress: ButtonProps['onPress'] = useCallback(
    (e) => {
      if (toggleOnPress && selected === undefined) {
        setInnerSelected((p) => !p);
      }
      onPress?.(e);
    },
    [onPress, selected, toggleOnPress]
  );

  const selectedBg = useMemo(() => withAlpha(primaryMain.val, 0.12), [primaryMain.val]);
  const isSelected = selected ?? innerSelected;
  const labelColor = isSelected ? primaryMain.val : black700.val;
  const borderColor = isSelected ? primaryMain.val : white600.val;
  const bgColor = isSelected ? selectedBg : 'transparent';

  const isText = typeof children === 'string';

  return (
    <StyledButton {...props} onPress={handlePress} style={{ borderColor, backgroundColor: bgColor }}>
      <XStack items="center" gap={8}>
        {left ? <Slot>{left}</Slot> : null}
        {isText ? <Label style={{ color: labelColor }}>{children}</Label> : children}
        {right ? <Slot>{right}</Slot> : null}
      </XStack>
    </StyledButton>
  );
};

const sizePadding: Record<any, { h: number; px: number }> = {
  sm: { h: 30, px: 12 },
  md: { h: 36, px: 14 },
  lg: { h: 42, px: 16 }
};

const StyledButton = styled(Button, {
  rounded: 9999,
  borderWidth: 1,
  borderColor: '$primaryMain',
  bg: 'transparent'
});

const Label = styled(Text, {
  fontSize: 15,
  lineHeight: 17,
  fontWeight: '500',
  color: '$black700'
});

const Slot = styled(View, {
  items: 'center',
  justify: 'center'
});

function withAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
