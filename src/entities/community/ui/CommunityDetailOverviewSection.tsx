import { Share } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { GetThemeValueForKey, styled, Text, useTheme, XStack } from 'tamagui';

import { AnimatedHeart } from '@/shared/ui/icons/animation';

import {
  CommunityAdoptCardCarousel,
  CommunityAdoptCardHeader,
  CommunityAdoptCardTags,
  CommunityAdoptCardTitle
} from './CommunityAdoptCard';

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
      <HeaderWrapper mb={14}>
        <CommunityAdoptCardHeader image={image} nickname={nickname} displayTime={displayTime} />
        <XStack gap={16} items="center">
          <AnimatedHeart onPress={onPressLike} />
          <Pressable hitSlop={8} onPress={() => onPressShare(id)}>
            <Share size={22} color={white600.val as GetThemeValueForKey<'color'>} />
          </Pressable>
        </XStack>
      </HeaderWrapper>
      <CommunityAdoptCardTitle title={title} numberOfLines={undefined} mb={16} />
      <CommunityAdoptCardCarousel images={images} />
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
