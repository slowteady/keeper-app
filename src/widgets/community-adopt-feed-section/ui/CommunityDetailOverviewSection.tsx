import { Pressable } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import {
  CommunityAdoptCardCarousel,
  CommunityAdoptCardHeader,
  CommunityAdoptCardTags,
  CommunityAdoptCardTitle
} from '@/entities';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share } from '@/shared/ui/icons/outline';

export interface CommunityDetailOverviewSectionProps {
  id: number;
  image: string;
  nickname: string;
  displayTime: string;
  title: string;
  images: string[];
  tags: string[];
  content: string;
  onPressLike: () => void;
  onPressShare: (id: number) => void;
}

export const CommunityDetailOverviewSection = ({
  id,
  image,
  nickname,
  displayTime,
  title,
  images,
  tags,
  content,
  onPressLike,
  onPressShare
}: CommunityDetailOverviewSectionProps) => {
  const { white600 } = useTheme();

  return (
    <>
      <HeaderWrapper mb={16}>
        <CommunityAdoptCardHeader image={image} nickname={nickname} displayTime={displayTime} />
        <XStack gap={20} items="center">
          <AnimatedHeart onPress={onPressLike} />
          <Pressable hitSlop={8} onPress={() => onPressShare(id)}>
            <Share width={22} height={22} color={white600.val} />
          </Pressable>
        </XStack>
      </HeaderWrapper>

      <CommunityAdoptCardTitle title={title} mb={16} />
      <CommunityAdoptCardCarousel images={images} mb={16} />
      <CommunityAdoptCardTags tags={tags} mb={20} />
      <Content>{content}</Content>
    </>
  );
};

const HeaderWrapper = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

const Content = styled(Text, {
  fontSize: 15,
  lineHeight: 23,
  fontWeight: 400,
  color: '$black800',
  letterSpacing: -0.25
});
