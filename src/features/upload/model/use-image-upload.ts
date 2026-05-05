import { useMutation } from '@tanstack/react-query';

import { getPresignedUrls } from '@/entities/upload';

const uploadOne = async (uri: string, uploadUrl: string) => {
  const blob = await fetch(uri).then((r) => r.blob());
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
