import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  //
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});
