import { styled, Text, View } from 'tamagui';

export interface CommentListProps {
  placeholder?: string;
  commentList: any[];
}

export const CommentList = ({ placeholder, commentList }: CommentListProps) => {
  const isEmpty = commentList.length === 0;

  return (
    <Container>
      {isEmpty ? (
        <View flex={1} items="center" justify="center">
          <EmptyText>{placeholder}</EmptyText>
        </View>
      ) : (
        <Text>CommentList</Text>
      )}
    </Container>
  );
};

const Container = styled(View, {
  flex: 1,
  bg: '$white900',
  height: 200
});

const EmptyText = styled(Text, {
  fontSize: 14,
  lineHeight: 20,
  color: '$black500',
  fontWeight: 500,
  text: 'center'
});
