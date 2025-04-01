import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  //
}

const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      {children}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({});
