import { useMutation } from '@tanstack/react-query';
import * as ImageManipulator from 'expo-image-manipulator';

import { getPresignedUrls } from '@/entities/upload';

const ensureJpeg = async (uri: string): Promise<string> => {
  if (/\.jpe?g($|\?)/i.test(uri)) return uri;
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    format: ImageManipulator.SaveFormat.JPEG,
    compress: 0.85
  });
  return result.uri;
};

const uploadOne = async (uri: string, uploadUrl: string) => {
  const jpegUri = await ensureJpeg(uri);
  const blob = await fetch(jpegUri).then((r) => r.blob());
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
