import { styled, Text, XStack, YStack } from 'tamagui';

import { hasValue } from '@/shared/lib';

export type CommunityDetailHealthSectionProps = {
  neuterYn?: string;
  vaccinationCheck?: string;
  healthCheck?: string;
  health: string;
};

const ynText = (v?: string): string | null => (v === 'Y' ? '했어요' : v === 'N' ? '안 했어요' : null);

const VACCINE_LABEL: Record<string, string> = {
  NOT: '안 했어요',
  FIRST: '1차',
  SECOND: '2차',
  THIRD: '3차'
};
const vaccineText = (v?: string): string | null => (v ? (VACCINE_LABEL[v] ?? null) : null);

export const CommunityDetailHealthSection = ({
  neuterYn,
  vaccinationCheck,
  healthCheck,
  health
}: CommunityDetailHealthSectionProps) => {
  const rows = [
    { label: '중성화', value: ynText(neuterYn) },
    { label: '예방접종', value: vaccineText(vaccinationCheck) },
    { label: '건강검진', value: ynText(healthCheck) }
  ].filter((row): row is { label: string; value: string } => row.value !== null);

  if (rows.length === 0 && !hasValue(health)) return null;

  return (
    <YStack gap={12}>
      <SectionLabel>건강정보</SectionLabel>
      <Box>
        {rows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
        {hasValue(health) && (
          <>
            <NoteDivider />
            <YStack gap={6}>
              <NoteLabel>건강 특이사항</NoteLabel>
              <NoteText>{health}</NoteText>
            </YStack>
          </>
        )}
      </Box>
    </YStack>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <XStack items="flex-start" justify="space-between" gap={12}>
    <RowLabel>{label}</RowLabel>
    <RowValue lineBreakStrategyIOS="hangul-word" style={{ textAlign: 'right' }}>
      {value}
    </RowValue>
  </XStack>
);

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

const RowLabel = styled(Text, {
  shrink: 0,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 22,
  color: '$black800'
});

const RowValue = styled(Text, {
  shrink: 1,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black700'
});

const NoteDivider = styled(YStack, {
  height: 1,
  bg: '$white800'
});

const NoteLabel = styled(Text, {
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 22,
  color: '$black800'
});

const NoteText = styled(Text, {
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black700'
});
