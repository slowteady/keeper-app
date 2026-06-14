import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

import { Check } from '@/shared/ui/icons/solid';

import { InfoItem } from './info-item';

export type AdoptBasicInfoGridProps = {
  age: string;
  gender: string;
  weight: string;
};

export const AdoptBasicInfoGrid = ({ age, gender, weight }: AdoptBasicInfoGridProps) => (
  <XStack gap={8} justify="space-between" flex={1}>
    <InfoItem label="나이" value={age} />
    <InfoItem label="성별" value={gender} />
    <InfoItem label="크기/몸무게" value={weight} />
  </XStack>
);

export type AdoptDetailInfoSectionProps = AdoptBasicInfoGridProps & {
  healthCheck: string;
  neuterYn: string;
  vaccinationCheck: string;
};

const splitItems = (raw?: string) =>
  (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const neuterText = (v?: string) => (v === 'Y' ? '했어요' : v === 'N' ? '안 했어요' : '알 수 없어요');

export const AdoptDetailInfoSection = ({
  age,
  gender,
  weight,
  healthCheck,
  neuterYn,
  vaccinationCheck
}: AdoptDetailInfoSectionProps) => {
  const vaccines = splitItems(vaccinationCheck);
  const healthItems = splitItems(healthCheck);

  return (
    <YStack gap={20}>
      <AdoptBasicInfoGrid age={age} gender={gender} weight={weight} />
      <Box>
        <InfoRow label="중성화" value={neuterText(neuterYn)} />
        <InfoRow label="예방접종" items={vaccines} />
        <InfoRow label="건강검진" items={healthItems} />
      </Box>
    </YStack>
  );
};

const InfoRow = ({ label, value, items }: { label: string; value?: string; items?: string[] }) => {
  const { primaryMain } = useTheme();
  const chips = items ?? [];

  return (
    <XStack items="flex-start" gap={12}>
      <RowLabel>{label}</RowLabel>
      <Content>
        {chips.length > 0 ? (
          chips.map((item) => (
            <Chip key={item}>
              <Check width={16} height={16} color={primaryMain.val} />
              <ChipText>{item}</ChipText>
            </Chip>
          ))
        ) : (
          <RowValue>{value ?? '알 수 없어요'}</RowValue>
        )}
      </Content>
    </XStack>
  );
};

const Box = styled(YStack, {
  bg: '$backgroundDefault',
  rounded: 12,
  p: 20,
  gap: 16
});

const RowLabel = styled(Text, {
  width: 76,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 24,
  color: '$black800'
});

const Content = styled(XStack, {
  flex: 1,
  flexWrap: 'wrap',
  justify: 'flex-end',
  items: 'center',
  gap: 8
});

const Chip = styled(XStack, {
  items: 'center',
  gap: 4
});

const ChipText = styled(Text, {
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 24,
  color: '$black800'
});

const RowValue = styled(Text, {
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 24,
  color: '$black600'
});
