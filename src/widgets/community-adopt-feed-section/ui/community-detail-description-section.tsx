import { styled, Text, YStack } from 'tamagui';

import { Link } from '@/shared/ui';

export type CommunityDetailDescriptionSectionProps = {
  relatedLink: string;
};

const hasValue = (value?: string) => !!value && value.trim().length > 0;

export const CommunityDetailDescriptionSection = ({ relatedLink }: CommunityDetailDescriptionSectionProps) => {
  if (!hasValue(relatedLink)) return null;

  return (
    <Wrap>
      <Label>관련 링크</Label>
      <Link url={relatedLink} text="원문 링크" />
    </Wrap>
  );
};

const Wrap = styled(YStack, {
  gap: 8
});

const Label = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});
