import { ExternalLink, Link2 } from '@tamagui/lucide-icons';
import { Linking, Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

import { hasValue } from '@/shared/lib';

export type CommunityDetailDescriptionSectionProps = {
  relatedLink: string;
};

const getDomain = (url: string) => {
  const match = url.match(/^https?:\/\/([^/]+)/i);
  return match ? match[1].replace(/^www\./, '') : url;
};

export const CommunityDetailDescriptionSection = ({ relatedLink }: CommunityDetailDescriptionSectionProps) => {
  if (!hasValue(relatedLink)) return null;

  const handlePress = () => {
    Linking.openURL(relatedLink).catch(() => {});
  };

  return (
    <YStack gap={12}>
      <SectionLabel>관련 링크</SectionLabel>
      <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <LinkBox>
          <Link2 size={20} color="$black600" />
          <LinkBody>
            <LinkTitle numberOfLines={1}>원문 링크</LinkTitle>
            <LinkUrl numberOfLines={1}>{getDomain(relatedLink)}</LinkUrl>
          </LinkBody>
          <ExternalLink size={16} color="$black500" />
        </LinkBox>
      </Pressable>
    </YStack>
  );
};

const SectionLabel = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const LinkBox = styled(XStack, {
  bg: '$backgroundDefault',
  rounded: 12,
  p: 16,
  items: 'center',
  gap: 12
});

const LinkBody = styled(YStack, {
  flex: 1,
  gap: 2
});

const LinkTitle = styled(Text, {
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 20,
  color: '$black800'
});

const LinkUrl = styled(Text, {
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 16,
  color: '$black500'
});
