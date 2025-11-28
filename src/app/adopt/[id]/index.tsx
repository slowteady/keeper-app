// app/adopt/[id].tsx

import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';
import { ScrollView, styled, View } from 'tamagui';

import { useAdopt, useShelter } from '@/entities';
import { SuspenseFallback } from '@/shared';
import { AdoptDetailDescriptionSection, AdoptDetailInfoSection, AdoptDetailOverviewSection } from '@/widgets';

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <AdoptDetailContent id={id} />
      </Suspense>
    </Container>
  );
};

export default Page;

const AdoptDetailContent = ({ id }: { id: string }) => {
  const { data: adopt } = useAdopt({ id });
  const { data: shelter } = useShelter({ id: adopt.shelterId, enabled: !!adopt.shelterId });

  return (
    <ScrollView decelerationRate="fast" pt={40}>
      <View mb={20} px={20}>
        <AdoptDetailOverviewSection title={adopt.title} images={adopt.images} description={adopt.description} />
      </View>

      <Divider mb={36} />

      <View px={20} pb={32}>
        <AdoptDetailInfoSection
          age={adopt.age}
          gender={adopt.gender}
          weight={adopt.weight}
          healthCheck={adopt.healthCheck}
          neuterYn={adopt.neuterYn}
          vaccinationCheck={adopt.vaccinationCheck}
        />
      </View>

      <View px={20} pb={40}>
        <AdoptDetailDescriptionSection specialMark={adopt.specialMark} shelter={shelter} />
      </View>
    </ScrollView>
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});
