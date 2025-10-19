import { styled, Text, XStack } from 'tamagui';

export const FieldLabel = ({ title, required = false }: { title: string; required?: boolean }) => {
  return (
    <XStack items="baseline" mb={8}>
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
