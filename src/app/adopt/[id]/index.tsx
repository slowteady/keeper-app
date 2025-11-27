import { ScrollView, styled, View } from 'tamagui';

import { useAdopt } from '@/features';
import { AdoptDetailDescriptionSection, AdoptDetailInfoSection, AdoptDetailOverviewSection } from '@/widgets';

const Page = () => {
  const { data } = useAdopt();
  // const { data: shelterData } = useGetShelterQuery(abandonmentData?.shelterId || '', {
  //   enabled: Boolean(abandonmentData?.shelterId)
  // });
  // const transformedShelterData = useMemo(() => shelterData && transformShelterData(shelterData), [shelterData]);
  if (!data) return null;

  return (
    <Container>
      <ScrollView decelerationRate="fast" pt={40}>
        <View mb={20} px={20}>
          <AdoptDetailOverviewSection title={data.title} images={data.images} description={data.description} />
        </View>

        <Divider mb={36} />

        <View px={20} pb={32}>
          <AdoptDetailInfoSection
            age={data.age}
            gender={data.gender}
            weight={data.weight}
            healthCheck={data.healthCheck}
            neuterYn={data.neuterYn}
            vaccinationCheck={data.vaccinationCheck}
          />
        </View>

        <View px={20} pb={40}>
          <AdoptDetailDescriptionSection
            specialMark={data.specialMark}
            // shelter={data.shelter}
          />
        </View>
      </ScrollView>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});
