import { TransformedShelterValue } from '@/domains/shelter/business/shelter.business';
import { Button } from '@/shared/components/atoms/Button';
import { ShelterTelModal } from '@/shared/components/organisms/ShelterTelModal';
import { theme } from '@/shared/constants/theme.constants';
import { useLayout } from '@/shared/hooks/useLayout';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TransformedAbandonmentDetail } from '../../business/announcement.business';
import { AbandonmentDetailCardSection } from '../organisms/AbandonmentDetailCardSection';
import { AbandonmentDetailDescriptionSection } from '../organisms/AbandonmentDetailDescriptionSection';
import { AbandonmentDetailInfoSection } from '../organisms/AbandonmentDetailInfoSection';

export interface AbandonmentsDetailTemplateProps {
  abandonment: TransformedAbandonmentDetail;
  shelter?: TransformedShelterValue;
}

export const AbandonmentsDetailTemplate = ({ abandonment, shelter }: AbandonmentsDetailTemplateProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { bottom } = useLayout();

  const { weight, gender, age, specialMark, careTel, neuterYn } = abandonment;

  const handlePress = useCallback(() => {
    setModalOpen(true);
  }, []);

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
          <Button onPress={handlePress} style={styles.fixedButton}>
            <Text style={styles.buttonText}>보호소에 문의하기</Text>
          </Button>
        </View>
      </View>

      <ShelterTelModal open={modalOpen} onClose={() => setModalOpen(false)} tel={careTel} name={shelter?.name} />
    </>
  );
};

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
