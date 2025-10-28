import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, View } from 'tamagui';

import { RightArrow } from '../icons/solid';

export interface ViewAllButtonProps {
  onPress: () => void;
}

export const ViewAllButton = ({ onPress }: ViewAllButtonProps) => {
  const { black400 } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.button}>
      <ArrowWrap>
        <RightArrow width={26} height={26} color={black400.val} />
      </ArrowWrap>
      <StyledText>전체보기</StyledText>
    </Pressable>
  );
};

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

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  }
});
