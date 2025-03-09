import theme from '@/constants/theme';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

export interface BasicModalProps {
  open: boolean;
  onPressBackdrop?: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

const Layout = ({ open, onPressBackdrop, children, containerStyle }: BasicModalProps) => {
  return (
    <Modal animationType="fade" visible={open} transparent={true}>
      <Pressable style={styles.overlay} onPress={onPressBackdrop}>
        <View style={[styles.innerContainer, containerStyle]}>{children}</View>
      </Pressable>
    </Modal>
  );
};

export interface BasicModalTitleProps extends TextProps {
  value: string;
}
const Title = ({ value, ...props }: BasicModalTitleProps) => {
  const { style, ...rest } = props;

  return (
    <Text style={[styles.title, style]} {...rest}>
      {value}
    </Text>
  );
};

export interface BasicModalDescriptionProps extends TextProps {
  value: string;
}
const Description = ({ value, ...props }: BasicModalDescriptionProps) => {
  const { style, ...rest } = props;

  return (
    <Text style={[styles.description, style]} {...rest}>
      {value}
    </Text>
  );
};

export interface ButtonsProps {
  onClose: () => void;
  onPress: () => void;
  PrimaryTextProps: TextProps;
  SecondaryTextProps: TextProps;
  style?: StyleProp<ViewStyle>;
}
const Buttons = ({ onClose, onPress, PrimaryTextProps, SecondaryTextProps, style }: ButtonsProps) => {
  const { style: primaryTextStyle, children: primaryChildren, ...primary } = PrimaryTextProps;
  const { style: secondaryTextStyle, children: secondaryChildren, ...secondary } = SecondaryTextProps;

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={[styles.closeButton, style]} onPress={onClose} activeOpacity={0.5}>
        <Text style={[styles.buttonText, secondaryTextStyle]} {...secondary}>
          {secondaryChildren}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.primaryButton, style]} onPress={onPress} activeOpacity={0.5}>
        <Text style={[styles.buttonText, primaryTextStyle]} {...primary}>
          {primaryChildren}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const BasicModal = Object.assign(Layout, {
  Title,
  Description,
  Buttons
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerContainer: {
    width: '80%',
    borderRadius: 14,
    backgroundColor: theme.colors.white[900],
    paddingHorizontal: 20
  },
  title: {
    color: theme.colors.black[800],
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18
  },
  description: {
    color: theme.colors.black[500],
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6
  },
  closeButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: theme.colors.white[800],
    borderRadius: 10
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 10
  },
  buttonText: {
    color: theme.colors.black[800],
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center'
  }
});
