import { Plus } from '@tamagui/lucide-icons';
import { styled, View } from 'tamagui';

export const EmptyAvatar = ({ onPress }: { onPress?: () => void }) => {
  return (
    <Container onPress={onPress}>
      <WhiteCircle>
        <Plus size={18} color="#D3D9D5" strokeWidth={3} />
      </WhiteCircle>
    </Container>
  );
};

const Container = styled(View, {
  width: 72,
  height: 72,
  rounded: 8,
  bg: '$backgroundDefault',
  borderWidth: 1,
  borderColor: '$white600',
  items: 'center',
  justify: 'center'
});

const WhiteCircle = styled(View, {
  rounded: 99,
  bg: '$white900',
  width: 24,
  height: 24,
  items: 'center',
  justify: 'center'
});
