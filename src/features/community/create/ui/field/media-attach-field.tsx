import { Plus } from '@tamagui/lucide-icons';
import { type Control, useController } from 'react-hook-form';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import { useMediaPicker } from '@/features/community/create/model/use-media-picker';
import { ImageSelector } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';
import { VideoAttachment } from './video-attachment';

const MEDIA_BOX_SIZE = 72;

export type MediaAttachFieldProps = {
  control: Control<CommunityAdoptFormDto>;
  label: string;
  required?: boolean;
  max?: number;
  readOnly?: boolean;
};

export const MediaAttachField = ({ control, label, required, max = 10, readOnly = false }: MediaAttachFieldProps) => {
  const { field: imagesField, fieldState } = useController({ control, name: 'images' });
  const { field: videoField } = useController({ control, name: 'video' });
  const { pickMedia } = useMediaPicker();

  const images: string[] = Array.isArray(imagesField.value) ? imagesField.value : [];
  const video = videoField.value ?? null;

  const handleAdd = async () => {
    const picked = await pickMedia();
    if (picked.images.length > 0) {
      imagesField.onChange([...images, ...picked.images].slice(0, max));
    }
    if (picked.video) {
      videoField.onChange(picked.video);
    }
  };

  const canAdd = !readOnly && (images.length < max || !video);

  return (
    <YStack>
      <XStack items="center" justify="space-between">
        <FieldLabel title={label} required={required} mb={10} />
        <XStack>
          <Text fontSize={12} fontWeight="$4" color={images.length > 0 ? '#707070' : '#BEBEBE'}>
            {images.length}
          </Text>
          <Text fontSize={12} fontWeight="$4" color="#BEBEBE">
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
      />

      <XStack gap={8} mt={8} items="center">
        {video && (
          <VideoAttachment
            thumbnailUri={video.thumbnailUri}
            size={MEDIA_BOX_SIZE}
            readOnly={readOnly}
            onRemove={() => videoField.onChange(null)}
          />
        )}
        {canAdd && (
          <AddButton testID="media-attach-add" width={MEDIA_BOX_SIZE} height={MEDIA_BOX_SIZE} onPress={handleAdd}>
            <Plus size={24} color="#BEBEBE" />
          </AddButton>
        )}
      </XStack>

      <FieldError message={fieldState.error?.message} />
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
