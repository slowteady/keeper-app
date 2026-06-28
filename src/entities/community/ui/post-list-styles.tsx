import { Image } from 'expo-image';
import { styled, Text, View } from 'tamagui';

export const CategoryChip = styled(View, {
  py: 5,
  px: 6,
  rounded: 4,
  bg: '$white850'
});

export const CategoryText = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black700',
  letterSpacing: -0.24
});

export const DisplayTime = styled(Text, {
  fontSize: 12,
  fontWeight: '500',
  color: '$black500'
});

export const Thumbnail = styled(Image, {
  width: 64,
  height: 64,
  rounded: 8
});
