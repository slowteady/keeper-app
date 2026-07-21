import { Fragment } from 'react';
import { ColorTokens, styled, Text, View, XStack, YStack } from 'tamagui';

export type DetailSpecRow = { label: string; value: string };

export type DetailSpecSectionProps = {
  title: string;
  rows: DetailSpecRow[];
  boxBg?: ColorTokens | string;
  headerGap?: number;
  withDividers?: boolean;
};

export const DetailSpecSection = ({
  title,
  rows,
  boxBg,
  headerGap = 12,
  withDividers = false
}: DetailSpecSectionProps) => {
  if (rows.length === 0) return null;

  return (
    <YStack gap={headerGap}>
      <SectionLabel>{title}</SectionLabel>
      <Box {...(boxBg ? { bg: boxBg as never } : {})}>
        {rows.map((row, idx) => (
          <Fragment key={row.label}>
            {withDividers && idx > 0 && <Divider />}
            <Row>
              <Label>{row.label}</Label>
              <Value lineBreakStrategyIOS="hangul-word" style={{ textAlign: 'right' }}>
                {row.value}
              </Value>
            </Row>
          </Fragment>
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
  bg: '#F7F7F7',
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

const Divider = styled(View, {
  height: 1,
  bg: '#D9D9D9'
});
