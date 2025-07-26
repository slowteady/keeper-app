import { KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform } from 'react-native';

export interface KeyboardViewProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode;
}

export const KeyboardView = ({ children, ...props }: KeyboardViewProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
      style={{ flex: 1 }}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
