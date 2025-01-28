import { abandonmentDetailBusiness } from '@/businesses/abandonmentsBusiness';
import AbandonmentDetailCardSection from '@/components/sections/abandonments/AbandonmentDetailCardSection';
import AbandonmentDetailPrimaryInfoSection from '@/components/sections/abandonments/AbandonmentDetailPrimaryInfoSection';
import AbandonmentDetailSecondaryInfoSection from '@/components/sections/abandonments/AbandonmentDetailSecondaryInfoSection';
import theme from '@/constants/theme';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import BottomSheet, { BottomSheetProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { forwardRef, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AbandonmentsDetailTemplateProps {
  data?: AbandonmentValue;
  isLoading: boolean;
}

// NOTE: 스켈레톤 만들기
const AbandonmentsDetailTemplate = ({ data, isLoading }: AbandonmentsDetailTemplateProps) => {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['50%'], []);
  const isComplete = data && !isLoading;

  const handlePress = () => {
    bottomSheetRef.current?.expand();
    // <Button onPress={{Linking.openURL(`tel:01012341234`)}} />
  };

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) bottomSheetRef.current?.close();
  };

  return (
    <View style={styles.container}>
      <ScrollView decelerationRate="fast" contentContainerStyle={{ paddingBottom: 100 }}>
        {isComplete ? (
          <>
            <AbandonmentDetailCardSection data={abandonmentDetailBusiness(data)} isLoading={isLoading} />
            <View style={styles.divider} />
            <AbandonmentDetailPrimaryInfoSection data={data} />
            <View style={styles.divider} />
            <AbandonmentDetailSecondaryInfoSection data={data} />
          </>
        ) : (
          <></>
        )}
      </ScrollView>

      <View style={[styles.bottomWrap, { paddingBottom: bottom || 20 }]}>
        <TouchableOpacity activeOpacity={0.5} onPress={handlePress} style={styles.fixedButton}>
          <Text style={styles.buttonText}>보호소에 문의하기</Text>
        </TouchableOpacity>
      </View>

      <ShelterBottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onAnimate={handleAnimate}
        animationConfigs={{ duration: 300 }}
      />
    </View>
  );
};

export default AbandonmentsDetailTemplate;

const ShelterBottomSheet = forwardRef<BottomSheetMethods, Omit<BottomSheetProps, 'children'>>((props, ref) => {
  return (
    <BottomSheet ref={ref} {...props}>
      <BottomSheetView style={{ flex: 1 }}>
        <Text>바텀시트</Text>
      </BottomSheetView>
    </BottomSheet>
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
  buttonText: {
    color: theme.colors.black[900],
    fontWeight: '600',
    fontSize: 15
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.white[800]
  }
});
