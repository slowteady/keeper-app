import { styled, Text, XStack, YStack } from 'tamagui';

export type DetailSpecRow = { label: string; value: string };

export const DetailSpecSection = ({ title, rows }: { title: string; rows: DetailSpecRow[] }) => {
  if (rows.length === 0) return null;

  return (
    <YStack gap={12}>
      <SectionLabel>{title}</SectionLabel>
      <Box>
        {rows.map((row) => (
          <Row key={row.label}>
            <Label>{row.label}</Label>
            <Value style={{ textAlign: 'right' }}>{row.value}</Value>
          </Row>
        ))}
      </Box>
    </YStack>
  );
};

const SectionLabel = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const Box = styled(YStack, {
  bg: '$backgroundDefault',
  rounded: 12,
  p: 20,
  gap: 16
});

const Row = styled(XStack, {
  items: 'flex-start',
  justify: 'space-between',
  gap: 32
});

const Label = styled(Text, {
  shrink: 0,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 22,
  color: '$black800'
});

const Value = styled(Text, {
  shrink: 1,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black700'
});
