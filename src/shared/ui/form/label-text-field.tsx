import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { YStack } from 'tamagui';

import { TextField, TextFieldProps } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export interface LabelTextFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'value'> {
  label: string;
  required?: boolean;
  name: FieldPath<T>;
  control: Control<T>;
}

export const LabelTextField = <T extends FieldValues>({
  label,
  required,
  name,
  control,
  ...props
}: LabelTextFieldProps<T>) => {
  return (
    <YStack>
      <FieldLabel title={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const resolved = typeof field.value === 'string' ? field.value : '';
          return (
            <>
              <TextField
                ref={field.ref}
                variant="fill"
                value={resolved}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                style={{ fontWeight: resolved ? 500 : 400 }}
                status={fieldState.error ? 'error' : 'default'}
                {...props}
              />
              <FieldError message={fieldState.error?.message} />
            </>
          );
        }}
      />
    </YStack>
  );
};
