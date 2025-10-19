import { useCallback } from 'react';
import { XStack, YStack } from 'tamagui';

import { ChipButton, ChipButtonProps } from '../button/ChipButton';

type ChipGroupValue<T extends boolean> = T extends true ? string[] : string;
type ChipGroupOnChange<T extends boolean> = T extends true ? (value: string[]) => void : (value: string) => void;
export interface ChipOption {
  value: string;
  label: string;
}
export interface ChipGroupProps<T extends boolean = false>
  extends Omit<ChipButtonProps, 'children' | 'selected' | 'onPress'> {
  options: ChipOption[];
  value?: ChipGroupValue<T>;
  onChange?: ChipGroupOnChange<T>;
  multiple?: T;
  direction?: 'horizontal' | 'vertical';
  gap?: number;
}

export const ChipGroup = <T extends boolean = false>({
  options,
  value,
  onChange,
  multiple = false as T,
  direction = 'horizontal',
  gap = 4,
  ...chipProps
}: ChipGroupProps<T>) => {
  const handleChipPress = useCallback(
    (optionValue: string) => {
      if (multiple) {
        // 복수 선택
        const currentValues: string[] = Array.isArray(value) ? value : [];
        const newValues: string[] = currentValues.includes(optionValue)
          ? currentValues.filter((v: string) => v !== optionValue)
          : [...currentValues, optionValue];

        (onChange as ChipGroupOnChange<true>)?.(newValues);
      } else {
        // 단일 선택
        if (value !== optionValue) {
          (onChange as ChipGroupOnChange<false>)?.(optionValue);
        }
      }
    },
    [value, onChange, multiple]
  );

  const isSelected = useCallback(
    (optionValue: string) => {
      if (multiple) {
        return Array.isArray(value) ? value.includes(optionValue) : false;
      } else {
        return value === optionValue;
      }
    },
    [value, multiple]
  );

  const Container = direction === 'horizontal' ? XStack : YStack;

  return (
    <Container flexWrap="wrap" gap={gap} items={direction === 'horizontal' ? 'center' : 'flex-start'}>
      {options.map((option) => (
        <ChipButton
          key={option.value}
          selected={isSelected(option.value)}
          onPress={() => handleChipPress(option.value)}
          {...chipProps}
        >
          {option.label}
        </ChipButton>
      ))}
    </Container>
  );
};
