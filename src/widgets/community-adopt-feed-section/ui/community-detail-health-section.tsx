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
    <YStack gap={20}>
      <Box>
        <InfoRow label="중성화" value={ynText(neuterYn)} />
        <InfoRow label="예방접종" value={vaccineText(vaccinationCheck)} />
        <InfoRow label="건강검진" value={ynText(healthCheck)} />
      </Box>
      {hasValue(health) && (
        <YStack gap={8}>
          <Label>아파요</Label>
          <Description>{health}</Description>
        </YStack>
      )}
    </YStack>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <XStack justify="space-between" items="center">
    <RowLabel>{label}</RowLabel>
    <RowValue>{value}</RowValue>
  </XStack>
);

const Box = styled(YStack, {
  bg: '$backgroundDefault',
  rounded: 12,
  p: 20,
  gap: 16
});

const RowLabel = styled(Text, {
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 20,
  color: '$black800'
});

const RowValue = styled(Text, {
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 20,
  color: '$black600'
});

const Label = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const Description = styled(Text, {
  fontSize: 16,
  lineHeight: 25,
  fontWeight: 400,
  color: '$black650',
  letterSpacing: -0.25
});
