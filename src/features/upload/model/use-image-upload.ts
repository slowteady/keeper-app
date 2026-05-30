import { useMutation } from '@tanstack/react-query';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

import { getPresignedUrls } from '@/entities/upload';

const MAX_DIMENSION = 1920;

const getImageSize = (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject)
  );

const processImage = async (uri: string): Promise<string> => {
  const { width, height } = await getImageSize(uri);
  const longest = Math.max(width, height);
  const actions =
    longest > MAX_DIMENSION ? [{ resize: width >= height ? { width: MAX_DIMENSION } : { height: MAX_DIMENSION } }] : [];
  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    format: ImageManipulator.SaveFormat.JPEG,
    compress: 0.85
  });
  return result.uri;
};

const uploadOne = async (uri: string, uploadUrl: string) => {
  const processed = await processImage(uri);
  const blob = await fetch(processed).then((r) => r.blob());
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob
  });
};

const uploadImages = async (uris: string[]) => {
  if (uris.length === 0) return [];

  const { data } = await getPresignedUrls({ count: uris.length });
  const items = data.data.items;

  await Promise.all(items.map((item, i) => uploadOne(uris[i], item.uploadUrl)));

  return items.map((item) => item.publicUrl);
};

export const useImageUpload = () => useMutation({ mutationFn: uploadImages });
