import { Control, Controller } from 'react-hook-form';
import { Text, TextAreaProps, XStack, YStack } from 'tamagui';

import { TextArea } from '@/shared';

import { TCreatePostDto } from '../../model';
import { FieldLabel } from './FieldLabel';

export interface LabelTextAreaProps extends TextAreaProps {
  label: string;
  required?: boolean;
  name: keyof TCreatePostDto;
  control: Control<TCreatePostDto>;
}

export const LabelTextArea = ({ label, required, name, control, ...props }: LabelTextAreaProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = typeof field.value === 'string' ? field.value : '';
        const length = value.length;

        return (
          <YStack>
            <XStack items="center" justify="space-between">
              <FieldLabel title={label} required={required} />

              {typeof props.maxLength === 'number' && (
                <XStack>
                  <Text fontSize={12} fontWeight="$4" color={length > 0 ? '#707070' : '#BEBEBE'}>
                    {length}
                  </Text>
                  <Text fontSize={12} fontWeight="$4" color="#BEBEBE">
                    /{props.maxLength}
                  </Text>
                </XStack>
              )}
            </XStack>

            <TextArea variant="fill" value={value} onChangeText={field.onChange} onBlur={field.onBlur} {...props} />
          </YStack>
        );
      }}
    />
  );
};
