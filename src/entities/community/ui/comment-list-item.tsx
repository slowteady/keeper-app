import { MoreVertical } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';

import { MyCommentItemDto } from '../schema';
import { CategoryChip, CategoryText, DisplayTime, Thumbnail } from './post-list-styles';

const CATEGORY_LABEL: Record<MyCommentItemDto['postCategory'], string> = {
  ADOPTION_PERSONAL: '개인입양',
  ADOPTION_LIFE: '입양생활',
  QNA: '궁금해요'
};

export type CommentListItemProps = {
  data: MyCommentItemDto;
  onPress: (postId: string, commentId: string) => void;
  onPressMore?: (data: MyCommentItemDto) => void;
};

export const CommentListItem = ({ data, onPress, onPressMore }: CommentListItemProps) => {
  return (
    <Pressable onPress={() => onPress(data.postId, data.id)}>
      <Container>
        <YStack flex={1} gap={8}>
          <XStack items="center" gap={8}>
            <CategoryChip>
              <CategoryText>{CATEGORY_LABEL[data.postCategory]}</CategoryText>
            </CategoryChip>
            <DisplayTime>{formatTimeAgo(data.displayTime)}</DisplayTime>
          </XStack>
          <Content numberOfLines={2} ellipsizeMode="tail">
            {data.content}
          </Content>
        </YStack>
        {(onPressMore || data.postThumbnail) && (
          <RightColumn>
            {onPressMore ? (
              <Pressable
                onPress={() => onPressMore(data)}
                hitSlop={10}
                accessibilityLabel="더보기"
                testID={`my-comment-more-${data.id}`}
              >
                <MoreVertical size={18} color="$black700" />
              </Pressable>
            ) : null}
            {data.postThumbnail && <Thumbnail source={{ uri: data.postThumbnail }} contentFit="cover" />}
          </RightColumn>
        )}
      </Container>
    </Pressable>
  );
};

const Container = styled(XStack, {
  py: 16,
  gap: 16,
  borderBottomWidth: 1,
  borderBottomColor: '$white850',
  items: 'flex-start'
});

const RightColumn = styled(YStack, {
  items: 'flex-end',
  gap: 10
});

const Content = styled(Text, {
  fontSize: 15,
  lineHeight: 22,
  fontWeight: '600',
  color: '$black900',
  letterSpacing: -0.45
});
