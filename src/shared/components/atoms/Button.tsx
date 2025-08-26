import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { theme } from '@/shared/constants/theme.constants';

export const Button = ({ children, disabled = false, style, ...props }: TouchableOpacityProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} disabled={disabled} style={[style, disabled && styles.disabled]} {...props}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: {
    backgroundColor: theme.colors.white[800]
  }
});
