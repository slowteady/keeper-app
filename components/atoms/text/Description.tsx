import theme from '@/constants/theme';
import { StyleSheet, Text, TextProps, View, ViewProps } from 'react-native';

export interface DescriptionProps extends ViewProps {
  PrimaryTextProps?: TextProps;
  SecondaryTextProps?: TextProps;
}
export const Description = ({ PrimaryTextProps, SecondaryTextProps, ...props }: DescriptionProps) => {
  const { style, ...rest } = props;
  const { children: primaryChildren, style: primaryStyle, ...primary } = PrimaryTextProps || {};
  const { children: secondaryChildren, style: secondaryStyle, ...secondary } = SecondaryTextProps || {};

  return (
    <View style={[styles.descriptionContainer, style]} {...rest}>
      <Text style={[styles.label, primaryStyle]} {...primary}>
        {primaryChildren}
      </Text>
      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.text, secondaryStyle]} {...secondary}>
        {secondaryChildren}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  descriptionContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    gap: 16,
    alignItems: 'center',
    marginBottom: 14
  },
  label: {
    flexShrink: 0,
    fontSize: 14,
    color: theme.colors.black[600],
    fontWeight: '400',
    lineHeight: 18
  },
  text: {
    flex: 1,
    color: theme.colors.black[900],
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18
  }
});
