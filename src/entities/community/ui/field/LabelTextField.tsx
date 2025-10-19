import { Control, Controller } from 'react-hook-form';
import { YStack } from 'tamagui';

import { TextField, TextFieldProps } from '@/shared';

import { TCreatePostDto } from '../../model';
import { FieldLabel } from './FieldLabel';

export interface LabelTextFieldProps extends TextFieldProps {
  label: string;
  required?: boolean;
  name: keyof TCreatePostDto;
  control: Control<TCreatePostDto>;
}

export const LabelTextField = ({ label, required, name, control, ...props }: LabelTextFieldProps) => {
  return (
    <YStack>
      <FieldLabel title={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field }) => <TextField variant="fill" {...field} {...props} />}
      />
    </YStack>
  );
};
