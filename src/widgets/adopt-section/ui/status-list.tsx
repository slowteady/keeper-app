import { styled, Text, XStack } from 'tamagui';

import { Question, XMark, YMark } from '@/shared/ui/icons/solid';

export type StatusListProps = {
  data: { label: string; status: string | 'NONE' }[];
};

export const StatusList = ({ data }: StatusListProps) => {
  return (
    <Container>
      {data.map((item, idx) => {
        const key = `${item.label}-${idx}`;

        const Icon = item.status === 'Y' ? YMark : item.status === 'N' ? XMark : Question;
        if (!Icon) return null;

        return (
          <XStack key={key} gap={6} items="center">
            <Label>{item.label}</Label>
            <Icon color="#7E7E7E" />
          </XStack>
        );
      })}
    </Container>
  );
};

const Container = styled(XStack, {
  flex: 1,
  rounded: 8,
  bg: '$backgroundDefault',
  py: 14,
  px: 24,
  justify: 'space-between'
});

const Label = styled(Text, {
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 20,
  color: '$black800'
});
