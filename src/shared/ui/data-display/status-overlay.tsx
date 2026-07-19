import { styled, Text, View } from 'tamagui';

export const StatusDimOverlay = styled(View, {
  position: 'absolute',
  t: 0,
  l: 0,
  r: 0,
  b: 0,
  rounded: 8,
  bg: '$black900',
  opacity: 0.45
});

export const StatusChip = ({ label, testID }: { label: string; testID?: string }) => {
  return (
    <View position="absolute" t={0} l={0} r={0} b={0} justify="center" items="center">
      <View px={10} py={5} rounded={999} bg="$black800" testID={testID}>
        <Text fontWeight={600} fontSize={12} lineHeight={14} color="#fff">
          {label}
        </Text>
      </View>
    </View>
  );
};
