import { TransformedAbandonmentDetail } from '@/businesses/abandonmentsBusiness';
import { TransformedShelterValue } from '@/businesses/sheltersBusiness';
import { BasicModal } from '@/components/organisms/modal/BasicModal';
import AbandonmentDetailCardSection from '@/components/sections/abandonments/AbandonmentDetailCardSection';
import AbandonmentDetailDescriptionSection from '@/components/sections/abandonments/AbandonmentDetailDescriptionSection';
import AbandonmentDetailInfoSection from '@/components/sections/abandonments/AbandonmentDetailInfoSection';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface AbandonmentsDetailTemplateProps {
  abandonment: TransformedAbandonmentDetail;
  shelter?: TransformedShelterValue;
}

const AbandonmentsDetailTemplate = ({ abandonment, shelter }: AbandonmentsDetailTemplateProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { bottom } = useLayout();

  const { weight, gender, age, specialMark, careTel, neuterYn } = abandonment;

  const handlePress = useCallback(() => {
    setModalOpen(true);
  }, []);
  const handlePressContact = useCallback(() => {
    const sanitizedNumber = careTel.replace(/-/g, '');
    Linking.openURL(`tel:${sanitizedNumber}`);
  }, [careTel]);

  return (
    <>
      <View style={styles.container}>
        <ScrollView decelerationRate="fast" bounces>
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <AbandonmentDetailCardSection data={abandonment} />
          </View>
          <View style={styles.divider} />
          <View style={{ paddingHorizontal: 20, paddingTop: 36, paddingBottom: 48 }}>
            <AbandonmentDetailInfoSection age={age} gender={gender} weight={weight} />
          </View>
          <View style={styles.divider} />
          <AbandonmentDetailDescriptionSection specialMark={specialMark} neuterYn={neuterYn} shelter={shelter} />
        </ScrollView>

        <View style={[styles.bottomWrap, { paddingBottom: bottom }]}>
          <TouchableOpacity activeOpacity={0.5} onPress={handlePress} style={styles.fixedButton}>
            <Text style={styles.buttonText}>보호소에 문의하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BasicModal
        open={modalOpen}
        onPressBackdrop={() => setModalOpen(false)}
        containerStyle={{ paddingTop: 32, paddingBottom: 16 }}
      >
        <BasicModal.Title value={`${shelter?.name || '담당자'}에 전화 문의하기`} style={{ marginBottom: 12 }} />
        <BasicModal.Description
          value={'*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다.'}
          style={{ marginBottom: 32 }}
        />
        <BasicModal.Buttons
          onPress={handlePressContact}
          onClose={() => setModalOpen(false)}
          PrimaryTextProps={{ children: '문의하기' }}
          SecondaryTextProps={{ children: '닫기' }}
        />
      </BasicModal>
    </>
  );
};

export default AbandonmentsDetailTemplate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default
  },
  bottomWrap: {
    paddingTop: 10,
    paddingHorizontal: 20,
    width: '100%',
    position: 'fixed',
    bottom: 0,
    backgroundColor: theme.colors.background.default
  },
  fixedButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 10
  },
  buttonText: {
    color: theme.colors.black[900],
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 18,
    textAlign: 'center'
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.white[800]
  }
});
