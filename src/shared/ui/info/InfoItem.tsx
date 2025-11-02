import { styled, Text, XStack, YStack } from 'tamagui';

export interface InfoItemProps {
  label: string;
  subLabel?: string;
  value: string;
}

export const InfoItem = ({ label, subLabel, value }: InfoItemProps) => {
  return (
    <YStack items="center" gap={10} flex={1}>
      <Label>{label}</Label>
      <Box>
        <Value>{value}</Value>
        {subLabel && <SubLabel>{subLabel}</SubLabel>}
      </Box>
    </YStack>
  );
};

const Label = styled(Text, {
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 20,
  color: '$black600'
});
const Box = styled(XStack, {
  width: '100%',
  py: 16,
  display: 'flex',
  items: 'center',
  justify: 'center',
  rounded: 8,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$white800'
});
const Value = styled(Text, {
  fontSize: 17,
  fontWeight: 700,
  lineHeight: 22,
  color: '$black800'
});
const SubLabel = styled(Text, {
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 18,
  color: '$black600',
  pl: 2,
  mt: 2
});
