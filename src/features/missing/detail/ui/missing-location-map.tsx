import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

export type MissingLocationMapProps = {
  lat: number;
  lng: number;
  address: string;
  onPressMap?: () => void;
};

export const MissingLocationMap = ({ lat, lng, address, onPressMap }: MissingLocationMapProps) => {
  return (
    <YStack gap={12}>
      <Title>실종 장소</Title>
      <MapFrame>
        <NaverMapView
          style={StyleSheet.absoluteFill}
          initialCamera={{ latitude: lat, longitude: lng, zoom: 15 }}
          isZoomGesturesEnabled={false}
          isScrollGesturesEnabled={false}
          isRotateGesturesEnabled={false}
          isTiltGesturesEnabled={false}
          isShowZoomControls={false}
          isShowScaleBar={false}
          isShowLocationButton={false}
        >
          <NaverMapMarkerOverlay latitude={lat} longitude={lng} width={28} height={32} anchor={{ x: 0.5, y: 1 }} />
        </NaverMapView>
        {onPressMap && (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onPressMap}
            accessibilityRole="button"
            accessibilityLabel="실종 장소 지도 크게 보기"
          />
        )}
      </MapFrame>
      <Address lineBreakStrategyIOS="hangul-word">{address}</Address>
    </YStack>
  );
};

const Title = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const MapFrame = styled(View, {
  width: '100%',
  aspectRatio: 16 / 10,
  rounded: 12,
  overflow: 'hidden',
  bg: '$white850'
});

const Address = styled(Text, {
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black700'
});
