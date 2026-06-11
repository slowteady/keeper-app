import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Text, useTheme, XStack } from 'tamagui';

type Variant = 'primary' | 'secondary';
type Size = 'small' | 'medium' | 'large';

export interface ChipButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  selected?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const SIZE_STYLES = {
  small: {
    button: { paddingVertical: 10, paddingHorizontal: 14, minWidth: 54 },
    text: { fontSize: 14, lineHeight: 16, fontWeight: '600' as const }
  },
  medium: {
    button: { paddingVertical: 10, paddingHorizontal: 16 },
    text: { fontSize: 15, lineHeight: 17, fontWeight: '500' as const }
  },
  large: {
    button: { paddingVertical: 12, paddingHorizontal: 18 },
    text: { fontSize: 16, lineHeight: 18, fontWeight: '500' as const }
  }
};

export const ChipButton = ({
  children,
  variant = 'primary',
  size = 'small',
  selected = false,
  left,
  right,
  onPress,
  style,
  ...props
}: ChipButtonProps) => {
  const theme = useTheme();
  const colors = getColors(variant, selected, theme);
  const sizeStyle = SIZE_STYLES[size];

  return (
    <Pressable
      {...props}
      onPress={onPress}
      style={[
        {
          borderRadius: 44,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
          borderColor: colors.border
        },
        sizeStyle.button,
        style
      ]}
    >
      <XStack items="center">
        {left}
        {typeof children === 'string' ? (
          <Text style={[sizeStyle.text, { color: colors.text }]}>{children}</Text>
        ) : (
          children
        )}
        {right}
      </XStack>
    </Pressable>
  );
};

const getColors = (variant: Variant, isSelected: boolean, theme: ReturnType<typeof useTheme>) => {
  if (variant === 'secondary') {
    return {
      bg: isSelected ? theme.blackMain.val : 'transparent',
      border: isSelected ? theme.blackMain.val : theme.white600.val,
      text: isSelected ? theme.white900.val : theme.black500.val
    };
  }

  return {
    bg: isSelected ? theme.primaryLightest.val : 'transparent',
    border: isSelected ? theme.primaryMain.val : theme.white600.val,
    text: isSelected ? theme.primaryMain.val : theme.black500.val
  };
};
