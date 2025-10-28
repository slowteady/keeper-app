import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TransformedShelterValue } from '@/domains/shelter/business/shelter.business';
import { ShelterTelModal } from '@/domains/shelter/components/organisms/modal';
import { Button, theme, useLayout } from '@/shared';

import { TransformedAbandonmentDetail } from '../../business/announcement.business';
import {
  AbandonmentDetailCardSection,
  AbandonmentDetailDescriptionSection,
  AbandonmentDetailInfoSection
} from '../organisms';

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
        <ScrollView decelerationRate="fast">
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
    flex: 1
  },
  bottomWrap: {
    paddingTop: 10,
    paddingHorizontal: 20,
    width: '100%',
    position: 'fixed',
    bottom: 0
  },
  fixedButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 14
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
