import { Control, Controller } from 'react-hook-form';
import { YStack } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import { TextField, TextFieldProps } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export interface LabelTextFieldProps extends TextFieldProps {
  label: string;
  required?: boolean;
  name: keyof CommunityAdoptFormDto;
  control: Control<CommunityAdoptFormDto>;
}

export const LabelTextField = ({ label, required, name, value, control, ...props }: LabelTextFieldProps) => {
  const hasValue = !!value;

  return (
    <YStack>
      <FieldLabel title={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <TextField
              variant="fill"
              value={value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              style={{ fontWeight: hasValue ? 500 : 400 }}
              status={fieldState.error ? 'error' : 'default'}
              {...props}
            />
            <FieldError message={fieldState.error?.message} />
          </>
        )}
      />
    </YStack>
  );
};
