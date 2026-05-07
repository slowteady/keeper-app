import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { compressImage } from './image';

const mockedManipulate = jest.mocked(ImageManipulator.manipulate);

const getLastCtx = () => {
  const results = mockedManipulate.mock.results;
  return results[results.length - 1].value;
};

const getLastImageRef = async () => {
  const ctx = getLastCtx();
  return await ctx.renderAsync.mock.results[0].value;
};

describe('compressImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('default(square=false) 는 crop 없이 resize 만 호출한다', async () => {
    await compressImage({
      uri: 'file:///input.jpg',
      sourceWidth: 1200,
      sourceHeight: 800
    });

    const ctx = getLastCtx();
    expect(ctx.crop).not.toHaveBeenCalled();
    expect(ctx.resize).toHaveBeenCalledWith({ width: 800 });
  });

  it('square=true, 가로가 긴 이미지(1200x800)는 가운데 정사각형으로 crop 한다', async () => {
    await compressImage({
      uri: 'file:///input.jpg',
      sourceWidth: 1200,
      sourceHeight: 800,
      square: true
    });

    const ctx = getLastCtx();
    expect(ctx.crop).toHaveBeenCalledWith({
      originX: 200,
      originY: 0,
      width: 800,
      height: 800
    });
    expect(ctx.resize).toHaveBeenCalledWith({ width: 800 });
  });

  it('square=true, 세로가 긴 이미지(800x1200)는 가운데 정사각형으로 crop 한다', async () => {
    await compressImage({
      uri: 'file:///input.jpg',
      sourceWidth: 800,
      sourceHeight: 1200,
      square: true
    });

    const ctx = getLastCtx();
    expect(ctx.crop).toHaveBeenCalledWith({
      originX: 0,
      originY: 200,
      width: 800,
      height: 800
    });
  });

  it('square=true, 정사각형 이미지(1000x1000)는 (0,0)부터 전체를 crop 한다', async () => {
    await compressImage({
      uri: 'file:///input.jpg',
      sourceWidth: 1000,
      sourceHeight: 1000,
      square: true
    });

    const ctx = getLastCtx();
    expect(ctx.crop).toHaveBeenCalledWith({
      originX: 0,
      originY: 0,
      width: 1000,
      height: 1000
    });
  });

  it('size 옵션이 resize 에 반영된다', async () => {
    await compressImage({
      uri: 'file:///input.jpg',
      sourceWidth: 1000,
      sourceHeight: 1000,
      size: 512
    });

    const ctx = getLastCtx();
    expect(ctx.resize).toHaveBeenCalledWith({ width: 512 });
  });

  it('quality 옵션이 saveAsync 에 반영되고 format 은 JPEG 로 고정된다', async () => {
    await compressImage({
      uri: 'file:///input.jpg',
      sourceWidth: 1000,
      sourceHeight: 1000,
      quality: 0.5
    });

    const imageRef = await getLastImageRef();
    expect(imageRef.saveAsync).toHaveBeenCalledWith({ compress: 0.5, format: SaveFormat.JPEG });
  });

  it('saveAsync 결과(ImageResult)를 그대로 반환한다', async () => {
    const result = await compressImage({
      uri: 'file:///input.jpg',
      sourceWidth: 1000,
      sourceHeight: 1000
    });

    expect(result).toEqual({
      uri: 'file:///mock/manipulated.jpg',
      width: 800,
      height: 800,
      base64: null
    });
  });
});
