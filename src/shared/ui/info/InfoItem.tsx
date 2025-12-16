import { styled, Text, XStack, YStack } from 'tamagui';

export interface InfoItemProps {
  label: string;
  subLabel?: string;
  value: string;
}

export const InfoItem = ({ label, subLabel, value }: InfoItemProps) => {
  return (
    <YStack items="center" gap={8} flex={1}>
      <Text fontSize={14} fontWeight="500" lineHeight={20} color="$black600">
        {label}
      </Text>

      <Box py={16}>
        <Text fontSize={17} fontWeight="700" lineHeight={22} color="$black800">
          {value}
        </Text>
        {subLabel && (
          <Text fontSize={12} fontWeight="400" lineHeight={18} color="$black600" pl={2} mt={2}>
            {subLabel}
          </Text>
        )}
      </Box>
    </YStack>
  );
};

const Box = styled(XStack, {
  items: 'center',
  justify: 'center',
  width: '100%',
  rounded: 8,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$white800'
});
