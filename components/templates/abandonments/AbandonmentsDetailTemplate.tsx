import { TransformedAbandonmentData } from '@/businesses/abandonmentsBusiness';
import { TransformedShelterValue } from '@/businesses/sheltersBusiness';
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
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AbandonmentsDetailTemplateProps {
  abandonment: TransformedAbandonmentData;
  shelter?: TransformedShelterValue;
}
// NOTE: 스켈레톤 만들기
const AbandonmentsDetailTemplate = ({ abandonment, shelter }: AbandonmentsDetailTemplateProps) => {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const { weight, gender, age, specialMark } = abandonment;

  const handlePress = () => {
    // <Button onPress={{Linking.openURL(`tel:01012341234`)}} />
    bottomSheetModalRef.current?.present();
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
        animationConfigs={{ duration: 300 }}
        handleIndicatorStyle={styles.indicator}
        style={styles.bsInnerContainer}
        backgroundStyle={styles.bsBackground}
      />
    </View>
  );
};

export default AbandonmentsDetailTemplate;

const ShelterBottomSheet = forwardRef<BottomSheetModalMethods, Omit<BottomSheetModalProps, 'children'>>(
  (props, ref) => {
    const { bottom } = useSafeAreaInsets();

    const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
    }, []);

    return (
      <BottomSheetModal ref={ref} backdropComponent={renderBackdrop} {...props}>
        <BottomSheetView style={[styles.bsViewContainer, { paddingBottom: bottom || 20 }]}>
          <Text style={styles.bsTitle}>보호소 운영정보</Text>

          <View style={{ flex: 1 }}>
            <View style={[styles.bsDivider, { marginBottom: 24 }]} />
            <View style={{ flex: 1 }}></View>
            <View style={[styles.bsDivider, { marginVertical: 24 }]} />
          </View>

          <Text style={styles.bsTitle}>보호소에 문의하기</Text>
          <TouchableOpacity activeOpacity={0.5} style={[styles.fixedButton]}>
            <Text style={[styles.buttonText, { fontSize: 14 }]}>asd</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

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
  }
});

ShelterBottomSheet.displayName = 'ShelterBottomSheet';
