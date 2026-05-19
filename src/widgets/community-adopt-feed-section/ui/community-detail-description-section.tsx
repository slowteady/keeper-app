import { styled, Text, YStack } from 'tamagui';

import { Link } from '@/shared/ui';

export type CommunityDetailDescriptionSectionProps = {
  specialMark: string;
  likes: string;
  dislikes: string;
  health: string;
  relatedLink: string;
};

// 빈 값이면 하이픈으로 fallback — 빈 자리 그대로 노출하면 사용자가 "정보 누락 / 오류" 로 오해.
const orHyphen = (value?: string) => (value && value.trim().length > 0 ? value : '-');

export const CommunityDetailDescriptionSection = ({
  specialMark,
  likes,
  dislikes,
  health,
  relatedLink
}: CommunityDetailDescriptionSectionProps) => {
  const hasRelatedLink = !!relatedLink && relatedLink.trim().length > 0;

  return (
    <Container>
      <Wrap>
        <Label>특징</Label>
        <Description>{orHyphen(specialMark)}</Description>
      </Wrap>
      <Wrap>
        <Label>좋아해요</Label>
        <Description>{orHyphen(likes)}</Description>
      </Wrap>
      <Wrap>
        <Label>싫어해요</Label>
        <Description>{orHyphen(dislikes)}</Description>
      </Wrap>
      <Wrap>
        <Label>아파요</Label>
        <Description>{orHyphen(health)}</Description>
      </Wrap>
      <Wrap>
        <Label>관련 링크</Label>
        {hasRelatedLink ? <Link url={relatedLink} text="원문 링크" /> : <Description>-</Description>}
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
  color: '$black650',
  letterSpacing: -0.25
});
