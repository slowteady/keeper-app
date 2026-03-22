import { ChevronRight } from '@tamagui/lucide-icons';
import { styled, Text, XStack, XStackProps } from 'tamagui';

export interface MenuProps {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  style?: XStackProps['style'];
}

export const Menu = ({ icon, label, onPress, style }: MenuProps) => {
  return (
    <Container onPress={onPress} hitSlop={12} style={style}>
      <XStack gap={8} items="center">
        {icon && icon}
        <Label>{label}</Label>
      </XStack>
      <ChevronRight size={21} color="$white600" />
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
