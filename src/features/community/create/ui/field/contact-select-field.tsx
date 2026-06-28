import { RefObject } from 'react';
import { Control, Controller, useFormState } from 'react-hook-form';
import { KeyboardTypeOptions, TextInput } from 'react-native';
import { Text, YStack } from 'tamagui';

import { CommunityAdoptFormDto, CREATE_POST_OPTIONS } from '@/entities/community';
import { ChipGroup, TextField } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export type ContactSelectFieldProps = {
  label: string;
  helper?: string;
  required?: boolean;
  control: Control<CommunityAdoptFormDto>;
  inputRef?: RefObject<TextInput | null>;
};

type ContactItemError = { value?: { message?: string } };

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const getPlaceholder = (type: string): string => {
  if (type === 'PHONE') return '예) 010-1234-5678';
  if (type === 'EMAIL') return '예) keeper@example.com';
  if (type === 'SNS') return '예) https://open.kakao.com/... (오픈채팅·인스타 링크)';
  const option = CREATE_POST_OPTIONS.contact.find((opt) => opt.value === type);
  return option?.label || '';
};

const getKeyboardType = (type: string): KeyboardTypeOptions => {
  if (type === 'PHONE') return 'phone-pad';
  if (type === 'EMAIL') return 'email-address';
  if (type === 'SNS') return 'url';
  return 'default';
};

const getMaxLength = (type: string): number => (type === 'PHONE' ? 13 : 100);

const formatValue = (type: string, value: string): string => (type === 'PHONE' ? formatPhone(value) : value);

export const ContactSelectField = ({ control, label, helper, required, inputRef }: ContactSelectFieldProps) => {
  const { errors, submitCount } = useFormState({ control, name: 'contact' });
  const showErrors = submitCount > 0;
  const contactError = errors.contact;
  const rootMessage =
    contactError && 'message' in contactError ? (contactError as { message?: string }).message : undefined;
  const itemErrors = Array.isArray(contactError) ? (contactError as ContactItemError[]) : undefined;

  return (
    <Controller
      name="contact"
      control={control}
      render={({ field }) => {
        const selectedTypes = field.value.map((item) => item.type);

        const handleChipChange = (newTypes: string[]) => {
          const updatedContact = newTypes.map((type) => {
            const existingItem = field.value.find((item) => item.type === type);
            return existingItem || { type, value: '' };
          });
          field.onChange(updatedContact as CommunityAdoptFormDto['contact']);
        };

        const handleValueChange = (type: string, value: string) => {
          const next = formatValue(type, value);
          const updatedContact = field.value.map((item) => (item.type === type ? { ...item, value: next } : item));
          field.onChange(updatedContact);
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
              options={CREATE_POST_OPTIONS.contact}
              value={selectedTypes}
              onChange={handleChipChange}
            />

            {field.value.length > 0 && (
              <YStack gap={10} mt={12}>
                {field.value.map((item, idx) => {
                  const itemMessage = showErrors ? itemErrors?.[idx]?.value?.message : undefined;
                  return (
                    <YStack key={`${item.type}-${idx}`} gap={4}>
                      <TextField
                        ref={idx === 0 ? inputRef : undefined}
                        placeholder={getPlaceholder(item.type)}
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
