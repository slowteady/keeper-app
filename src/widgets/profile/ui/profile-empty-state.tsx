import { styled, View } from 'tamagui';

import { FeedNodata, FeedNodataProps } from '@/shared/ui';

export const ProfileEmptyState = (props: FeedNodataProps) => (
  <Container>
    <FeedNodata {...props} />
  </Container>
);

const Container = styled(View, {
  flex: 1,
  items: 'center',
  justify: 'center',
  py: 60
});
