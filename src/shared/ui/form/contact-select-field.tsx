import { RefObject } from 'react';
import { Control, Controller, FieldPath, FieldValues, useFormState } from 'react-hook-form';
import { KeyboardTypeOptions, TextInput } from 'react-native';
import { Text, YStack } from 'tamagui';

import { ChipGroup, ChipOption, TextField } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export type ContactSelectFieldProps<T extends FieldValues> = {
  label: string;
  helper?: string;
  required?: boolean;
  name: FieldPath<T>;
  control: Control<T>;
  options: ChipOption[];
  inputRef?: RefObject<TextInput | null>;
};

type ContactItemError = { value?: { message?: string } };

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const getPlaceholder = (type: string, options: ChipOption[]): string => {
  if (type === 'PHONE') return '예) 010-1234-5678';
  if (type === 'EMAIL') return '예) keeper@example.com';
  if (type === 'SNS') return '예) https://open.kakao.com/... (오픈채팅·인스타 링크)';
  return options.find((opt) => opt.value === type)?.label || '';
};

const getKeyboardType = (type: string): KeyboardTypeOptions => {
  if (type === 'PHONE') return 'phone-pad';
  if (type === 'EMAIL') return 'email-address';
  if (type === 'SNS') return 'url';
  return 'default';
};

const getMaxLength = (type: string): number => (type === 'PHONE' ? 13 : 100);

const formatValue = (type: string, value: string): string => (type === 'PHONE' ? formatPhone(value) : value);

export const ContactSelectField = <T extends FieldValues>({
  control,
  name,
  options,
  label,
  helper,
  required,
  inputRef
}: ContactSelectFieldProps<T>) => {
  const { errors, submitCount } = useFormState({ control, name });
  const showErrors = submitCount > 0;
  const contactError = errors[name];
  const rootMessage =
    contactError && 'message' in contactError ? (contactError as { message?: string }).message : undefined;
  const itemErrors = Array.isArray(contactError) ? (contactError as ContactItemError[]) : undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const items: { type: string; value: string }[] = Array.isArray(field.value) ? field.value : [];
        const selectedTypes = items.map((item) => item.type);

        const handleChipChange = (newTypes: string[]) => {
          field.onChange(newTypes.map((type) => items.find((item) => item.type === type) || { type, value: '' }));
        };

        const handleValueChange = (type: string, value: string) => {
          const next = formatValue(type, value);
          field.onChange(items.map((item) => (item.type === type ? { ...item, value: next } : item)));
        };

        return (
          <YStack>
            <FieldLabel title={label} required={required} mb={helper ? 4 : 8} />
            {helper && (
              <Text fontSize={13} lineHeight={18} color="$black500" mb={12}>
                {helper}
              </Text>
            )}
            <ChipGroup
              variant="secondary"
              multiple
              options={options}
              value={selectedTypes}
              onChange={handleChipChange}
            />

            {items.length > 0 && (
              <YStack gap={10} mt={12}>
                {items.map((item, idx) => {
                  const itemMessage = showErrors ? itemErrors?.[idx]?.value?.message : undefined;
                  return (
                    <YStack key={`${item.type}-${idx}`} gap={4}>
                      <TextField
                        ref={idx === 0 ? inputRef : undefined}
                        placeholder={getPlaceholder(item.type, options)}
                        keyboardType={getKeyboardType(item.type)}
                        maxLength={getMaxLength(item.type)}
                        autoCapitalize={item.type === 'EMAIL' ? 'none' : 'sentences'}
                        variant="fill"
                        value={item.value}
                        onChangeText={(text) => handleValueChange(item.type, text)}
                        status={itemMessage ? 'error' : 'default'}
                      />
                      <FieldError message={itemMessage} />
                    </YStack>
                  );
                })}
              </YStack>
            )}
            <FieldError message={showErrors ? rootMessage : undefined} />
          </YStack>
        );
      }}
    />
  );
};
