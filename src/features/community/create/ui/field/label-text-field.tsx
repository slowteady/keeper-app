import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { YStack } from 'tamagui';

import { TextField, TextFieldProps } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export interface LabelTextFieldProps<T extends FieldValues> extends TextFieldProps {
  label: string;
  required?: boolean;
  name: FieldPath<T>;
  control: Control<T>;
}

export const LabelTextField = <T extends FieldValues>({
  label,
  required,
  name,
  value,
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
          // value prop 우선 (외부 watch), 없으면 field.value fallback (재활용 폼)
          const resolved = value ?? (typeof field.value === 'string' ? field.value : '');
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
