import { Control, Controller } from 'react-hook-form';
import { Text, XStack, YStack } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import { ImageSelector, ImageSelectorProps } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export interface LabelImageSelectorProps extends Omit<ImageSelectorProps, 'value' | 'onChange'> {
  label: string;
  required?: boolean;
  name: keyof CommunityAdoptFormDto;
  control: Control<CommunityAdoptFormDto>;
}

const IMAGE_BOX_SIZE = 72;

export const LabelImageSelector = ({ label, required, name, control, max = 10, ...props }: LabelImageSelectorProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const images: string[] = Array.isArray(field.value) ? (field.value as string[]) : [];
        const count = images.length;

        return (
          <YStack>
            <XStack items="center" justify="space-between">
              <FieldLabel title={label} required={required} mb={10} />

              <XStack>
                <Text fontSize={12} fontWeight="$4" color={count > 0 ? '#707070' : '#BEBEBE'}>
                  {count}
                </Text>
                <Text fontSize={12} fontWeight="$4" color="#BEBEBE">
                  /{max}
                </Text>
              </XStack>
            </XStack>

            <ImageSelector
              max={max}
              size={IMAGE_BOX_SIZE}
              value={images}
              onChange={(images: string[]) => field.onChange(images)}
              {...props}
            />
            <FieldError message={fieldState.error?.message} />
          </YStack>
        );
      }}
    />
  );
};
