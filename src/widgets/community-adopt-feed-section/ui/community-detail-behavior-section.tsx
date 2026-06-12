import { styled, Text, XStack, YStack } from 'tamagui';

export type CommunityDetailBehaviorItem = {
  label: string;
  value: string;
};

export type CommunityDetailBehaviorSectionProps = {
  items: CommunityDetailBehaviorItem[];
};

export const CommunityDetailBehaviorSection = ({ items }: CommunityDetailBehaviorSectionProps) => {
  if (items.length === 0) return null;

  return (
    <YStack gap={16}>
      <Title>성격·생활</Title>
      <YStack gap={14}>
        {items.map((item) => (
          <XStack key={item.label} items="center">
            <RowLabel>{item.label}</RowLabel>
            <RowValue>{item.value}</RowValue>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
};

const Title = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const RowLabel = styled(Text, {
  width: 96,
  fontSize: 15,
  lineHeight: 22,
  fontWeight: 400,
  color: '$black600'
});

const RowValue = styled(Text, {
  flex: 1,
  fontSize: 15,
  lineHeight: 22,
  fontWeight: 500,
  color: '$black800'
});
