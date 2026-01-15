import { ChevronRight } from '@tamagui/lucide-icons';
import { styled, Text, XStack } from 'tamagui';

export interface MenuProps {
  icon?: React.ReactNode;
  label: string;
  onPress: () => void;
}

export const Menu = ({ icon, label, onPress }: MenuProps) => {
  return (
    <Container onPress={onPress}>
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
  items: 'center',
  py: 16
});

const Label = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 21,
  color: '$black900'
});
