import { styled, Text, YStack } from 'tamagui';

import { Link } from '@/shared/ui';

export type CommunityDetailDescriptionSectionProps = {
  specialMark: string;
  likes: string;
  dislikes: string;
  health: string;
  relatedLink: string;
};

const hasValue = (value?: string) => !!value && value.trim().length > 0;

export const CommunityDetailDescriptionSection = ({
  specialMark,
  likes,
  dislikes,
  health,
  relatedLink
}: CommunityDetailDescriptionSectionProps) => {
  // 미작성 자유 서술은 "모름"이 아니므로 미상/하이픈 대신 항목 자체를 숨김
  const items = [
    { label: '특징', value: specialMark },
    { label: '좋아해요', value: likes },
    { label: '싫어해요', value: dislikes },
    { label: '아파요', value: health }
  ].filter((item) => hasValue(item.value));

  return (
    <Container>
      {items.map((item) => (
        <Wrap key={item.label}>
          <Label>{item.label}</Label>
          <Description>{item.value}</Description>
        </Wrap>
      ))}
      {hasValue(relatedLink) && (
        <Wrap>
          <Label>관련 링크</Label>
          <Link url={relatedLink} text="원문 링크" />
        </Wrap>
      )}
    </Container>
  );
};

const Container = styled(YStack, {
  gap: 24
});

const Wrap = styled(YStack, {
  gap: 8
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
