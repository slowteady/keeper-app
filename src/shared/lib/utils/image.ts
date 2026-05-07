import { ImageManipulator, ImageResult, SaveFormat } from 'expo-image-manipulator';

export type CompressImageOptions = {
  uri: string;
  sourceWidth: number;
  sourceHeight: number;
  /** true면 짧은 변 기준 정중앙 정사각형 크롭. iOS picker의 1:1 미보장 회피용. (default: false) */
  square?: boolean;
  /** 결과 width. square=true면 height도 동일. (default: 800) */
  size?: number;
  /** JPEG 품질 0~1 (default: 0.75) */
  quality?: number;
};

export const compressImage = async ({
  uri,
  sourceWidth,
  sourceHeight,
  square = false,
  size = 800,
  quality = 0.75
}: CompressImageOptions): Promise<ImageResult> => {
  const ctx = ImageManipulator.manipulate(uri);

  if (square) {
    const side = Math.min(sourceWidth, sourceHeight);
    ctx.crop({
      originX: (sourceWidth - side) / 2,
      originY: (sourceHeight - side) / 2,
      width: side,
      height: side
    });
  }
  ctx.resize({ width: size });

  const imageRef = await ctx.renderAsync();
  return imageRef.saveAsync({ compress: quality, format: SaveFormat.JPEG });
};
