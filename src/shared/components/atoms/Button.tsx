import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

export const Button = ({ children, ...props }: TouchableOpacityProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      {children}
    </TouchableOpacity>
  );
};

// const styles = StyleSheet.create({});
