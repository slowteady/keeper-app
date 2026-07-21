import { Plus } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { useMediaPicker } from '@/shared/lib/media';
import { MediaVideoDto } from '@/shared/model';
import { ImageSelector, VideoViewer } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';
import { VideoAttachment } from './video-attachment';

const MEDIA_BOX_SIZE = 72;

export type MediaAttachFieldProps<T extends FieldValues> = {
  control: Control<T>;
  label: string;
  required?: boolean;
  max?: number;
  readOnly?: boolean;
  imagesName?: FieldPath<T>;
  videoName?: FieldPath<T>;
};

export const MediaAttachField = <T extends FieldValues>({
  control,
  label,
  required,
  max = 10,
  readOnly = false,
  imagesName = 'images' as FieldPath<T>,
  videoName = 'video' as FieldPath<T>
}: MediaAttachFieldProps<T>) => {
  const { field: imagesField, fieldState } = useController({ control, name: imagesName });
  const { field: videoField } = useController({ control, name: videoName });
  const { pickMedia } = useMediaPicker();
  const [viewerOpen, setViewerOpen] = useState(false);

  const images: string[] = Array.isArray(imagesField.value) ? imagesField.value : [];
  const video = (videoField.value ?? null) as MediaVideoDto | null;
  const mediaCount = images.length + (video ? 1 : 0);

  const handleAdd = async () => {
    const picked = await pickMedia();
    const nextVideo = picked.video ?? video;
    if (picked.images.length > 0) {
      const imageSlots = max - (nextVideo ? 1 : 0);
      imagesField.onChange([...images, ...picked.images].slice(0, imageSlots));
    }
    if (picked.video) {
      videoField.onChange(picked.video);
    }
  };

  const canAdd = !readOnly && mediaCount < max;

  return (
    <YStack>
      <XStack items="center" justify="space-between">
        <FieldLabel title={label} required={required} mb={10} />
        <XStack>
          <Text fontSize={12} fontWeight="$4" color={mediaCount > 0 ? '$black650' : '$black500'}>
            {mediaCount}
          </Text>
          <Text fontSize={12} fontWeight="$4" color="$black500">
            /{max}
          </Text>
        </XStack>
      </XStack>

      <ImageSelector
        max={max}
        size={MEDIA_BOX_SIZE}
        value={images}
        onChange={(next) => imagesField.onChange(next)}
        readOnly={readOnly}
        hideAddButton
        trailing={
          <>
            {video && (
              <VideoAttachment
                thumbnailUri={video.thumbnailUri}
                size={MEDIA_BOX_SIZE}
                readOnly={readOnly}
                onPress={() => setViewerOpen(true)}
                onRemove={() => videoField.onChange(null)}
              />
            )}
            {canAdd && (
              <AddButton testID="media-attach-add" width={MEDIA_BOX_SIZE} height={MEDIA_BOX_SIZE} onPress={handleAdd}>
                <Plus size={24} color="$black500" />
              </AddButton>
            )}
          </>
        }
      />

      <FieldError message={fieldState.error?.message} />

      {viewerOpen && video && <VideoViewer uri={video.uri} onClose={() => setViewerOpen(false)} />}
    </YStack>
  );
};

const AddButton = styled(View, {
  rounded: 10,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$white600',
  items: 'center',
  justify: 'center'
});
