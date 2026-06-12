import { styled, Text, XStack, YStack } from 'tamagui';

import { CREATE_POST_OPTIONS } from '@/entities/community';

export type CommunityDetailHealthSectionProps = {
  neuterYn?: string;
  vaccinationCheck?: string;
  healthCheck?: string;
  health: string;
};

const hasValue = (value?: string) => !!value && value.trim().length > 0;

const lookup = (options: readonly { value: string; label: string }[], v?: string) =>
  options.find((o) => o.value === v)?.label ?? '모름';

const VACCINE_LABEL: Record<string, string> = {
  NOT: '미접종',
  FIRST: '1차접종',
  SECOND: '2차접종',
  THIRD: '3차접종'
};

export const CommunityDetailHealthSection = ({
  neuterYn,
  vaccinationCheck,
  healthCheck,
  health
}: CommunityDetailHealthSectionProps) => {
  const chips = [
    { label: '중성화', value: lookup(CREATE_POST_OPTIONS.neuterYn, neuterYn) },
    { label: '백신접종', value: (vaccinationCheck && VACCINE_LABEL[vaccinationCheck]) || '모름' },
    { label: '건강검진', value: lookup(CREATE_POST_OPTIONS.healthCheck, healthCheck) }
  ];

  return (
    <YStack gap={24}>
      <ChipRow>
        {chips.map((chip) => (
          <YStack key={chip.label} items="center" gap={4}>
            <ChipLabel>{chip.label}</ChipLabel>
            <ChipValue>{chip.value}</ChipValue>
          </YStack>
        ))}
      </ChipRow>
      {hasValue(health) && (
        <YStack gap={8}>
          <Label>아파요</Label>
          <Description>{health}</Description>
        </YStack>
      )}
    </YStack>
  );
};

const ChipRow = styled(XStack, {
  flex: 1,
  rounded: 8,
  bg: '$backgroundDefault',
  py: 14,
  px: 24,
  justify: 'space-between'
});

const ChipLabel = styled(Text, {
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 18,
  color: '$black600'
});

const ChipValue = styled(Text, {
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 20,
  color: '$black800'
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
