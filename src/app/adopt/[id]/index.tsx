import { useLocalSearchParams } from 'expo-router';
import { Suspense, useState } from 'react';
import { ScrollView, styled, Text, View } from 'tamagui';

import { useAdopt, useShelter } from '@/entities';
import { CallShelterModal } from '@/features';
import { BottomButton, SuspenseFallback, useLayout } from '@/shared';
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
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { bottom } = useLayout();

  const { data: adopt } = useAdopt({ id });
  const { data: shelter } = useShelter({ id: adopt.shelterId });

  const hasCallNumber = !!shelter?.tel;

  return (
    <>
      <ScrollView
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          { position: 'relative', paddingTop: 40, paddingBottom: hasCallNumber ? undefined : bottom } as any
        }
      >
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

        <View px={20}>
          <AdoptDetailDescriptionSection specialMark={adopt.specialMark} shelter={shelter} />
        </View>
      </ScrollView>

      {hasCallNumber && (
        <>
          <BottomButton onPress={() => setCallModalOpen((prev) => !prev)}>
            <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
              보호소에 문의하기
            </Text>
          </BottomButton>

          <CallShelterModal
            open={callModalOpen}
            onClose={() => setCallModalOpen(false)}
            tel={shelter.tel!}
            name={shelter.name}
          />
        </>
      )}
    </>
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
