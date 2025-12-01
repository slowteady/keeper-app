import { Text, YStack } from 'tamagui';

export interface ShelterDetailOverviewSectionProps {
  title: string;
  images: string[];
  description: { label: string; value: string }[];
}

export const ShelterDetailOverviewSection = () => {
  return (
    <YStack>
      <Text fontSize={28} lineHeight={38} fontWeight="500" color="$black900">
        ShelterDetailOverviewSection
      </Text>
    </YStack>
  );
};
