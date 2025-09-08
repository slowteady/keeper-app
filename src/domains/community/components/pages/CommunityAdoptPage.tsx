import { fakerKO } from '@faker-js/faker';
import { useMemo } from 'react';
import { styled, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/utils';

import { CommunityAdoptTemplate } from '../templates';

export const CommunityAdoptPage = () => {
  const adoptListValue = useMemo(() => {
    return Array.from({ length: 50 }, (_, id) => ({
      id: fakerKO.string.uuid(),
      user: { image: fakerKO.image.avatar(), nickname: fakerKO.person.fullName() },
      displayTime: id === 1 ? formatTimeAgo(fakerKO.date.recent()) : formatTimeAgo(fakerKO.date.past()),
      title: fakerKO.book.title(),
      content: fakerKO.lorem.text(),
      tags: [fakerKO.animal.dog(), fakerKO.animal.cat(), fakerKO.animal.bird(), fakerKO.animal.lion()],
      images: Array.from({ length: 5 }, () => fakerKO.image.avatar()),
      counts: {
        like: fakerKO.number.int({ min: 0, max: 1000 }),
        comment: fakerKO.number.int({ min: 0, max: 1000 }),
        view: fakerKO.number.int({ min: 0, max: 1000 })
      }
    })).sort((a, b) => new Date(b.displayTime).getTime() - new Date(a.displayTime).getTime());
  }, []);

  return (
    <Container>
      <CommunityAdoptTemplate data={adoptListValue} />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
