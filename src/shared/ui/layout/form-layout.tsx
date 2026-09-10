import { cloneElement, ReactElement, ReactNode, RefObject, useState } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { styled, YStack, YStackProps } from 'tamagui';

type FooterElement = ReactElement<{ onLayout?: (event: LayoutChangeEvent) => void }>;

export type FormLayoutProps = {
  children: ReactNode;
  footer: FooterElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
  containerProps?: YStackProps;
  scrollRef?: RefObject<KeyboardAwareScrollViewRef | null>;
};

export const FormLayout = ({ children, footer, contentContainerStyle, containerProps, scrollRef }: FormLayoutProps) => {
  const [footerHeight, setFooterHeight] = useState(0);

  const footerWithLayout = cloneElement(footer, {
    onLayout: (event: LayoutChangeEvent) => setFooterHeight(event.nativeEvent.layout.height)
  });

  return (
    <Container {...containerProps}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        mode="layout"
        keyboardShouldPersistTaps="handled"
        bottomOffset={footerHeight + 20}
        extraKeyboardSpace={footerHeight}
        contentContainerStyle={[contentContainerStyle, { paddingBottom: footerHeight }]}
      >
        {children}
      </KeyboardAwareScrollView>
      {footerWithLayout}
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1
});
