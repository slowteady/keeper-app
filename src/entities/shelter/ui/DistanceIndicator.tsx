import { styled, Text, XStack } from 'tamagui';

interface DistanceIndicatorProps {
  value: { distance: number; count: number }[];
}

const DISTANCES = [1, 5, 10, 30];

export const DistanceIndicator = ({ value }: DistanceIndicatorProps) => {
  return (
    <Container px={28} py={10}>
      {DISTANCES.map((dist, idx) => {
        const key = `${dist}-${idx}`;
        const matchedCount = value.find(({ distance }) => distance === dist);
        const count = matchedCount?.count ?? 0;

        return (
          <XStack key={key} items="center" gap={4}>
            <Text fontSize={13} lineHeight={22} fontWeight="400" color="$black600">
              {dist}km
            </Text>
            <Text fontSize={13} lineHeight={22} fontWeight="700" color="$black700">
              {count}곳
            </Text>
          </XStack>
        );
      })}
    </Container>
  );
};

const Container = styled(XStack, {
  justify: 'space-between',
  items: 'center',
  bg: '$backgroundDefault',
  rounded: 6
});
