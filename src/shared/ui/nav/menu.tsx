import { ChevronRight } from '@tamagui/lucide-icons';
import { ColorTokens, Spinner, styled, Text, View, XStack, XStackProps } from 'tamagui';

export type MenuProps = {
  icon?: React.ReactNode;
  label: string;
  labelColor?: ColorTokens;
  showDot?: boolean;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: XStackProps['style'];
  testID?: string;
};

export const Menu = ({
  icon,
  label,
  labelColor,
  showDot = false,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  testID
}: MenuProps) => {
  const isBlocked = disabled || isLoading;

  return (
    <Container
      onPress={isBlocked ? undefined : onPress}
      hitSlop={12}
      opacity={disabled && !isLoading ? 0.4 : 1}
      style={style}
      testID={testID}
    >
      <XStack gap={8} items="center">
        {icon}
        <Label color={labelColor}>{label}</Label>
        {showDot && <Dot />}
      </XStack>
      {isLoading ? <Spinner size="small" color="#ADB3AF" /> : <ChevronRight size={21} color="#ADB3AF" />}
    </Container>
  );
};

const Dot = styled(View, {
  width: 6,
  height: 6,
  rounded: 3,
  bg: '$errorMain'
});

const Container = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});

const Label = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 21,
  color: '$black900',
  letterSpacing: -0.25
});
