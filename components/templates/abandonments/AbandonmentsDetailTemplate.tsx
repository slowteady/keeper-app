import { TransformedAbandonmentData } from '@/businesses/abandonmentsBusiness';
import { TransformedShelterValue } from '@/businesses/sheltersBusiness';
import { CandyIcon } from '@/components/atoms/icons/CandyIcon';
import { StethoscopeIcon } from '@/components/atoms/icons/StethoscopeIcon';
import { TelIcon } from '@/components/atoms/icons/TelIcon';
import { TimeIcon } from '@/components/atoms/icons/TimeIcon';
import { BasicModal } from '@/components/organisms/modal/BasicModal';
import AbandonmentDetailCardSection from '@/components/sections/abandonments/AbandonmentDetailCardSection';
import AbandonmentDetailPrimaryInfoSection from '@/components/sections/abandonments/AbandonmentDetailPrimaryInfoSection';
import AbandonmentDetailSecondaryInfoSection from '@/components/sections/abandonments/AbandonmentDetailSecondaryInfoSection';
import theme from '@/constants/theme';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AbandonmentsDetailTemplateProps {
  abandonment: TransformedAbandonmentData;
  shelter?: TransformedShelterValue;
}
const AbandonmentsDetailTemplate = ({ abandonment, shelter }: AbandonmentsDetailTemplateProps) => {
  const { bottom } = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const { weight, gender, age, specialMark, careTel } = abandonment;
  const { time, person, address, name } = shelter || {};
  const bottomSheetData = {
    time,
    careTel,
    person,
    address
  };

  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  const handlePressTelButton = () => {
    setIsVisible(true);
  };

  const handlePressContact = (tel: string) => {
    const sanitizedNumber = tel.replace(/-/g, '');
    Linking.openURL(`tel:${sanitizedNumber}`);
    setIsVisible(false);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) bottomSheetModalRef.current?.dismiss();
  };

  return (
    <View style={styles.container}>
      <ScrollView decelerationRate="fast" contentContainerStyle={{ paddingBottom: 100 }}>
        <AbandonmentDetailCardSection data={abandonment} />
        <View style={styles.divider} />
        <AbandonmentDetailPrimaryInfoSection age={age} gender={gender} weight={weight} />
        <View style={styles.divider} />
        <AbandonmentDetailSecondaryInfoSection specialMark={specialMark} />
      </ScrollView>

      <View style={[styles.bottomWrap, { paddingBottom: bottom || 20 }]}>
        <TouchableOpacity activeOpacity={0.5} onPress={handlePress} style={styles.fixedButton}>
          <Text style={styles.buttonText}>보호소에 문의하기</Text>
        </TouchableOpacity>
      </View>

      <ShelterBottomSheet
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onAnimate={handleAnimate}
        animationConfigs={{ duration: 100 }}
        handleIndicatorStyle={styles.indicator}
        style={styles.bsInnerContainer}
        backgroundStyle={styles.bsBackground}
        data={bottomSheetData}
        onPressButton={handlePressTelButton}
      />

      <BasicModal isVisible={isVisible} containerStyle={{ paddingTop: 32, paddingBottom: 16 }}>
        <BasicModal.Title value={`${name}에 전화 문의하기`} style={{ marginBottom: 12 }} />
        <BasicModal.Description
          value={'*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다.'}
          style={{ marginBottom: 32 }}
        />
        <BasicModal.Buttons
          onPress={() => handlePressContact(careTel)}
          onClose={() => setIsVisible(false)}
          PrimaryTextProps={{ children: '문의하기' }}
          SecondaryTextProps={{ children: '닫기' }}
        />
      </BasicModal>
    </View>
  );
};

export default AbandonmentsDetailTemplate;

interface ShelterBottomSheetProps extends Omit<BottomSheetModalProps, 'children'> {
  data: Partial<TransformedShelterValue> & { careTel: string };
  onPressButton: () => void;
}
const ShelterBottomSheet = forwardRef<BottomSheetModalMethods, ShelterBottomSheetProps>((props, ref) => {
  const { bottom } = useSafeAreaInsets();

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  }, []);

  const { data, onPressButton, ...rest } = props;
  const time = data.time || '정보 없음';
  const careTel = data.careTel || '정보 없음';
  const person = data.person || '정보 없음';
  const address = data.address || '정보 없음';

  return (
    <BottomSheetModal ref={ref} backdropComponent={renderBackdrop} {...rest}>
      <BottomSheetView style={[styles.bsViewContainer, { paddingBottom: bottom || 20 }]}>
        <Text style={styles.bsTitle}>보호소 운영정보</Text>

        <View style={{ flex: 1 }}>
          <View style={[styles.bsDivider, { marginBottom: 24 }]} />
          <View style={styles.dcContainer}>
            <View style={styles.dcBox}>
              <TimeIcon width={18} height={18} />
              <Text style={styles.dcText}>{time}</Text>
            </View>
            <View style={styles.dcBox}>
              <TelIcon width={18} height={18} />
              <Text style={styles.dcText}>{careTel}</Text>
            </View>
            <View style={styles.dcBox}>
              <StethoscopeIcon width={18} height={18} />
              <Text style={styles.dcText}>{person}</Text>
            </View>
            <View style={styles.dcBox}>
              <CandyIcon width={18} height={18} />
              <Text style={styles.dcText}>{address}</Text>
            </View>
          </View>
          <View style={[styles.bsDivider, { marginVertical: 24 }]} />
        </View>

        <Text style={styles.bsTitle}>보호소에 문의하기</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!data.careTel}
          onPress={onPressButton}
          style={[styles.fixedButton, !careTel && styles.disabledButton]}
        >
          <Text style={[styles.buttonText, { fontSize: 14 }]}>{careTel || '번호가 존재하지 않습니다.'}</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bottomWrap: {
    paddingTop: 10,
    paddingHorizontal: 20,
    width: '100%',
    position: 'absolute',
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
  disabledButton: {
    backgroundColor: theme.colors.black[400]
  },
  buttonText: {
    color: theme.colors.black[900],
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 17,
    textAlign: 'center'
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.white[800]
  },
  indicator: {
    width: 48,
    borderRadius: 30,
    backgroundColor: theme.colors.white[800]
  },
  bsInnerContainer: {
    paddingHorizontal: 20
  },
  bsBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  bsViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 20,
    flex: 1
  },
  bsTitle: {
    color: theme.colors.black[800],
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 20
  },
  bsDivider: {
    height: 1,
    backgroundColor: theme.colors.white[600]
  },
  dcContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 15
  },
  dcBox: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  dcText: {
    flex: 1,
    color: theme.colors.black[700],
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    flexWrap: 'wrap'
  }
});

ShelterBottomSheet.displayName = 'ShelterBottomSheet';
