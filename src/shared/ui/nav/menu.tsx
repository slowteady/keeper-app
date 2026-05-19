import { ChevronRight } from '@tamagui/lucide-icons';
import { ColorTokens, styled, Text, XStack, XStackProps } from 'tamagui';

export type MenuProps = {
  icon?: React.ReactNode;
  label: string;
  labelColor?: ColorTokens;
  onPress?: () => void;
  style?: XStackProps['style'];
  testID?: string;
};

export const Menu = ({ icon, label, labelColor, onPress, style, testID }: MenuProps) => {
  return (
    <Container onPress={onPress} hitSlop={12} style={style} testID={testID}>
      <XStack gap={8} items="center">
        {icon}
        <Label color={labelColor}>{label}</Label>
      </XStack>
      <ChevronRight size={21} color="#ADB3AF" />
    </Container>
  );
};

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
