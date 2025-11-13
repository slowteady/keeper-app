import { Camera, CameraChangeReason, Region } from '@mj-studio/react-native-naver-map';

export type CameraParams = Camera & {
  reason?: CameraChangeReason;
  region?: Region;
};
