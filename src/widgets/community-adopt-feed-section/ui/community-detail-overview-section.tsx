import { styled, Text, useTheme, View, XStack } from 'tamagui';

import {
  CommunityAdoptCardCarousel,
  CommunityAdoptCardHeader,
  CommunityAdoptCardTags,
  CommunityAdoptCardTitle
} from '@/entities/community';
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
      <HeaderWrapper mb={20}>
        <CommunityAdoptCardHeader image={image} nickname={nickname} displayTime={displayTime} />
        <XStack gap={20} items="center">
          <AnimatedHeart size={26} onPress={onPressLike} />
          <View hitSlop={8} onPress={() => onPressShare(id)}>
            <Share width={26} height={26} color={white600.val} />
          </View>
        </XStack>
      </HeaderWrapper>

      <CommunityAdoptCardTitle title={title} mb={20} />
      <CommunityAdoptCardCarousel images={images} mb={16} />
      <CommunityAdoptCardTags tags={tags} mb={24} />
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
  lineHeight: 25,
  fontWeight: 400,
  color: '$black800',
  letterSpacing: -0.25
});
