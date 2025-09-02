import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { styled, XStack, YStack } from 'tamagui';

import { ADOPT_ANIMAL_TYPES, AnimalType } from '@/domains/animal';
import { ChipButton } from '@/shared/components/_atoms/ChipButton/ChipButton';
import { ButtonGroup } from '@/shared/components/_molecules/ButtonGroup';

import { communityAdoptFilterAtom } from '../../stores';

const CommunityAdoptTemplate = () => {
  const [adoptFilter, setAdoptFilter] = useAtom(communityAdoptFilterAtom);

  const handleChangeAnimalType = useCallback(
    (id: AnimalType) => {
      setAdoptFilter((prev) => ({ ...prev, animalType: id }));
    },
    [setAdoptFilter]
  );

  return (
    <Container>
      <ButtonGroup data={ADOPT_ANIMAL_TYPES} id={adoptFilter.animalType} onChange={handleChangeAnimalType} />
      <XStack mt={16}>
        <ChipButton toggleOnPress>강아지</ChipButton>
      </XStack>
    </Container>
  );
};

export default CommunityAdoptTemplate;

const Container = styled(YStack, {
  flex: 1,
  bg: '$backgroundDefault',
  px: 20,
  py: 16
});
