import { ImageManipulator, ImageResult, SaveFormat } from 'expo-image-manipulator';

export type CompressImageOptions = {
  uri: string;
  sourceWidth: number;
  sourceHeight: number;
  square?: boolean;
  size?: number;
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
