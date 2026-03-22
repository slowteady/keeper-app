import { styled, Text, useTheme, View, YStack } from 'tamagui';

import { RightArrow } from '@/shared/ui/icons/outline';

export interface ViewAllButtonProps {
  onPress: () => void;
}

export const ViewAllButton = ({ onPress }: ViewAllButtonProps) => {
  const { black400 } = useTheme();

  return (
    <Container onPress={onPress}>
      <ArrowWrap>
        <RightArrow width={26} height={26} color={black400.val} />
      </ArrowWrap>
      <StyledText>전체보기</StyledText>
    </Container>
  );
};

const Container = styled(YStack, {
  justify: 'center',
  items: 'center',
  gap: 10
});

const ArrowWrap = styled(View, {
  bg: '$white800',
  rounded: 5,
  opacity: 0.7,
  p: 12
});

const StyledText = styled(Text, {
  fontSize: 15,
  lineHeight: 17,
  fontWeight: '500',
  text: 'center',
  color: '$black600'
});
