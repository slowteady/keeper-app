import { styled, Text, XStack, YStack } from 'tamagui';

export type CommunityDetailHealthSectionProps = {
  neuterYn?: string;
  vaccinationCheck?: string;
  healthCheck?: string;
  health: string;
};

const hasValue = (value?: string) => !!value && value.trim().length > 0;

const ynText = (v?: string) => (v === 'Y' ? '했어요' : v === 'N' ? '안 했어요' : '알 수 없어요');

const VACCINE_LABEL: Record<string, string> = {
  NOT: '안 했어요',
  FIRST: '1차',
  SECOND: '2차',
  THIRD: '3차'
};
const vaccineText = (v?: string) => (v ? (VACCINE_LABEL[v] ?? '알 수 없어요') : '알 수 없어요');

export const CommunityDetailHealthSection = ({
  neuterYn,
  vaccinationCheck,
  healthCheck,
  health
}: CommunityDetailHealthSectionProps) => {
  return (
    <YStack gap={12}>
      <SectionLabel>건강정보</SectionLabel>
      <Box>
        <InfoRow label="중성화" value={ynText(neuterYn)} />
        <InfoRow label="예방접종" value={vaccineText(vaccinationCheck)} />
        <InfoRow label="건강검진" value={ynText(healthCheck)} />
        {hasValue(health) && (
          <>
            <NoteDivider />
            <YStack gap={6}>
              <NoteLabel>아파요</NoteLabel>
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
    <RowValue style={{ textAlign: 'right' }}>{value}</RowValue>
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
