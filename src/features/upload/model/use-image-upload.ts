import { useMutation } from '@tanstack/react-query';

import { getPresignedUrls } from '@/entities/upload';
import { IS_MOCK_UPLOAD } from '@/shared/lib/dev/mock-upload';

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

  // 백엔드 presigned 미구현 시점 임시 — mock URL 그대로 통과 (image-selector 가 이미 https URL append)
  if (IS_MOCK_UPLOAD) return uris;

  const { data } = await getPresignedUrls({ count: uris.length });
  const items = data.data.items;

  await Promise.all(items.map((item, i) => uploadOne(uris[i], item.uploadUrl)));

  return items.map((item) => item.publicUrl);
};

export const useImageUpload = () => useMutation({ mutationFn: uploadImages });
