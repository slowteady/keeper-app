import { styled, useTheme, View } from 'tamagui';

import { Check } from '../icons/solid';

type CheckboxVariant = 'square' | 'circle' | 'icon';

type CheckboxProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  variant?: CheckboxVariant;
  size?: number;
  disabled?: boolean;
};

export const Checkbox = ({ checked, onChange, variant = 'square', size = 22, disabled = false }: CheckboxProps) => {
  const theme = useTheme();

  const handlePress = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  if (variant === 'icon') {
    const iconColor = checked ? theme.primaryMain?.val : theme.white600?.val;
    return (
      <IconBox width={size} height={size} disabled={disabled} onPress={handlePress} hitSlop={6}>
        <Check width={size} height={size} color={iconColor} />
      </IconBox>
    );
  }

  const innerIconSize = Math.round(size * 0.72);

  return (
    <Box
      variant={variant}
      checked={checked}
      disabled={disabled}
      width={size}
      height={size}
      onPress={handlePress}
      hitSlop={6}
    >
      {checked && <Check width={innerIconSize} height={innerIconSize} color="#FFFFFF" />}
    </Box>
  );
};

const Box = styled(View, {
  items: 'center',
  justify: 'center',
  variants: {
    variant: {
      square: { rounded: 6 },
      circle: { rounded: 9999 }
    },
    checked: {
      true: { bg: '$primaryMain', borderWidth: 0 },
      false: { bg: '$white900', borderWidth: 1, borderColor: '$white600' }
    },
    disabled: {
      true: { opacity: 0.5 },
      false: { opacity: 1 }
    }
  } as const
});

const IconBox = styled(View, {
  items: 'center',
  justify: 'center',
  variants: {
    disabled: {
      true: { opacity: 0.5 },
      false: { opacity: 1 }
    }
  } as const
});
