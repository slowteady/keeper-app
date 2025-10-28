import { Control, Controller } from 'react-hook-form';
import { Text, XStack, YStack } from 'tamagui';

import { ImageSelector, ImageSelectorProps } from '@/shared';

import { TCreatePostDto } from '../../model';
import { FieldLabel } from './FieldLabel';

export interface LabelImageSelectorProps extends Omit<ImageSelectorProps, 'value' | 'onChange'> {
  label: string;
  required?: boolean;
  name: keyof TCreatePostDto;
  control: Control<TCreatePostDto>;
}

const IMAGE_BOX_SIZE = 72;

export const LabelImageSelector = ({ label, required, name, control, max = 10, ...props }: LabelImageSelectorProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const images = Array.isArray(field.value) ? field.value : [];
        const count = images.length;

        return (
          <YStack>
            <XStack items="center" justify="space-between">
              <FieldLabel title={label} required={required} />

              <XStack>
                <Text fontSize={12} fontWeight="$4" color={count > 0 ? '#707070' : '#BEBEBE'}>
                  {count}
                </Text>
                <Text fontSize={12} fontWeight="$4" color="#BEBEBE">
                  /{max}
                </Text>
              </XStack>
            </XStack>

            <ImageSelector max={max} size={IMAGE_BOX_SIZE} value={images} onChange={field.onChange} {...props} />
          </YStack>
        );
      }}
    />
  );
};
