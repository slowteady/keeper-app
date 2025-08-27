import { ReactNode } from 'react';
import { StackProps } from 'tamagui';

export interface HeaderProps {
  showShadow?: boolean;
  ContainerProps?: StackProps;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}
