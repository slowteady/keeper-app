import { useCallback } from 'react';
import { XStack, YStack } from 'tamagui';

import { ChipButton, ChipButtonProps } from '../button/chip-button';

type ChipGroupValue<T extends boolean> = T extends true ? string[] : string;
type ChipGroupOnChange<T extends boolean> = T extends true ? (value: string[]) => void : (value: string) => void;

export type ChipOption = {
  value: string;
  label: string;
};

export interface ChipGroupProps<T extends boolean = false> extends Omit<
  ChipButtonProps,
  'children' | 'selected' | 'onPress'
> {
  options: ChipOption[];
  value?: ChipGroupValue<T>;
  onChange?: ChipGroupOnChange<T>;
  multiple?: T;
  direction?: 'horizontal' | 'vertical';
  gap?: number;
}

const DIRECTION_MAP = { horizontal: XStack, vertical: YStack } as const;

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
        const currentValues: string[] = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter((v) => v !== optionValue)
          : [...currentValues, optionValue];

        (onChange as ChipGroupOnChange<true>)?.(newValues);
      } else {
        if (value !== optionValue) {
          (onChange as ChipGroupOnChange<false>)?.(optionValue);
        }
      }
    },
    [value, onChange, multiple]
  );

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) ? value.includes(optionValue) : false;
    }
    return value === optionValue;
  };

  const Container = DIRECTION_MAP[direction];

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
