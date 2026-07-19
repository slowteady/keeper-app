import { styled, Text, XStack, XStackProps } from 'tamagui';

interface FieldLabelProps extends XStackProps {
  title: string;
  required?: boolean;
}

export const FieldLabel = ({ title, required = false, ...props }: FieldLabelProps) => {
  return (
    <XStack items="baseline" mb={8} {...props}>
      <Title>{title}</Title>
      {required && (
        <Text color="$primaryMain" fontSize={20}>
          *
        </Text>
      )}
    </XStack>
  );
};

const Title = styled(Text, {
  fontSize: 17,
  lineHeight: 24,
  fontWeight: 600,
  color: '$blackMain'
});
