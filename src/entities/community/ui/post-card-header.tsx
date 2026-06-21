import { Text, XStack } from 'tamagui';

import { ProfileAvatar } from '@/entities/profile';
import { formatTimeAgo } from '@/shared/lib';

export type PostCardHeaderProps = {
  image: string;
  nickname: string;
  displayTime: string;
};

export const PostCardHeader = ({ image, nickname, displayTime }: PostCardHeaderProps) => {
  return (
    <XStack items="center" flex={1} style={{ minWidth: 0 }}>
      <ProfileAvatar image={image} size={32} shape="rounded" />
      <Text
        fontSize={14}
        fontWeight={600}
        ml={10}
        color="$black650"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ flexShrink: 1 }}
      >
        {nickname}
      </Text>
      <Text fontSize={14} fontWeight={500} ml={4} letterSpacing={-0.25} color="$black400" style={{ flexShrink: 0 }}>
        {formatTimeAgo(displayTime)}
      </Text>
    </XStack>
  );
};
