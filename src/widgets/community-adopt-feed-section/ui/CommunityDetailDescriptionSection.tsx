import { styled, Text, YStack } from 'tamagui';

import { Link } from '@/shared';

export interface CommunityDetailDescriptionSectionProps {
  specialMark: string;
  likes: string;
  dislikes: string;
  health: string;
  relatedLink: string;
}
export const CommunityDetailDescriptionSection = ({
  specialMark,
  likes,
  dislikes,
  health,
  relatedLink
}: CommunityDetailDescriptionSectionProps) => {
  return (
    <Container>
      <Wrap>
        <Label>특징</Label>
        <Description>{specialMark}</Description>
      </Wrap>
      <Wrap>
        <Label>좋아해요</Label>
        <Description>{likes}</Description>
      </Wrap>
      <Wrap>
        <Label>싫어해요</Label>
        <Description>{dislikes}</Description>
      </Wrap>
      <Description>{dislikes}</Description>
      <Wrap>
        <Label>아파요</Label>
        <Description>{health}</Description>
      </Wrap>
      <Wrap>
        <Label>관련 링크</Label>
        <Link url={relatedLink} text="원문 링크" />
      </Wrap>
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
  color: '#707070',
  letterSpacing: -0.25
});
