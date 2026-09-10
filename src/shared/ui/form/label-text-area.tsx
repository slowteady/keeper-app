import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { TextInput } from 'react-native';
import { Text, TextAreaProps, XStack, YStack } from 'tamagui';

import { TextArea } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export interface LabelTextAreaProps<T extends FieldValues> extends TextAreaProps {
  label: string;
  required?: boolean;
  helper?: string;
  name: FieldPath<T>;
  control: Control<T>;
}

export const LabelTextArea = <T extends FieldValues>({
  label,
  required,
  helper,
  name,
  control,
  ...props
}: LabelTextAreaProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
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

            {helper && (
              <Text fontSize={13} lineHeight={18} color="$black500" mb={8}>
                {helper}
              </Text>
            )}

            <TextArea
              variant="fill"
              ref={field.ref as React.Ref<TextInput>}
              value={value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              {...props}
            />
            <FieldError message={fieldState.error?.message} />
          </YStack>
        );
      }}
    />
  );
};
