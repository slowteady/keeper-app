import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { styled, YStack } from 'tamagui';

import { userAtom } from '@/domains/auth';

import { CommunityAdoptTemplate } from '../templates';

export const CommunityAdoptPage = () => {
  const { image: userImage, nickname } = useAtomValue(userAtom);

  const adoptListValue = useMemo(() => {
    return Array.from({ length: 50 }, (_, id) => ({
      user: { image: userImage, nickname },
      displayTime: id / 2 === 0 ? dayjs().format('YYYY-MM-DD HH:mm:ss') : `2025-01-02 12:00:00`
    }));
  }, [userImage, nickname]);

  return (
    <Container>
      <CommunityAdoptTemplate data={adoptListValue} />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  bg: '$backgroundDefault',
  px: 20,
  py: 16
});
