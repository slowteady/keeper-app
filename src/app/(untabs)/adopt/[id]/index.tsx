import { useLocalSearchParams } from 'expo-router';
import { Suspense, useState } from 'react';
import { ScrollView, styled, Text, View } from 'tamagui';

import { useAdopt } from '@/features/adopt';
import { useShelter } from '@/features/shelter';
import { useLayout } from '@/shared/model';
import { BottomButton, CallModal, DetailErrorBoundary, SuspenseFallback } from '@/shared/ui';
import {
  AdoptDetailDescriptionSection,
  AdoptDetailInfoSection,
  AdoptDetailOverviewSection
} from '@/widgets/adopt-section';

export const ErrorBoundary = DetailErrorBoundary;

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
  const { shelterData: shelter, hasCallNumber } = useShelter({ id: adopt.shelterId });

  return (
    <>
      <ScrollView
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          { position: 'relative', paddingTop: 48, paddingBottom: hasCallNumber ? 24 : bottom } as any
        }
      >
        <View mb={30} px={20}>
          <AdoptDetailOverviewSection title={adopt.title} images={adopt.images} description={adopt.description} />
        </View>

        <Divider mb={30} />

        <View px={20} pb={48}>
          <AdoptDetailInfoSection
            age={adopt.age}
            gender={adopt.gender}
            weight={adopt.weight}
            healthCheck={adopt.healthCheck ?? ''}
            neuterYn={adopt.neuterYn}
            vaccinationCheck={adopt.vaccinationCheck ?? ''}
          />
        </View>

        <View px={20}>
          <AdoptDetailDescriptionSection
            specialMark={adopt.specialMark}
            shelter={shelter}
            hasCallNumber={hasCallNumber}
          />
        </View>
      </ScrollView>

      {hasCallNumber && (
        <>
          <BottomButton onPress={() => setCallModalOpen((prev) => !prev)}>
            <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
              보호소에 문의하기
            </Text>
          </BottomButton>

          <CallModal
            open={callModalOpen}
            onClose={() => setCallModalOpen(false)}
            tel={shelter?.tel!}
            title={`${shelter?.name}에 문의하기`}
            description="*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다."
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
