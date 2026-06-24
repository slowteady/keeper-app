import { Switch } from 'react-native';
import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

export type NotificationToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
};

export const NotificationToggleRow = ({
  label,
  description,
  value,
  locked = false,
  onChange
}: NotificationToggleRowProps) => {
  const { primaryMain, white600, white850 } = useTheme();

  return (
    <Row opacity={locked ? 0.5 : 1}>
      <YStack flex={1} gap={4} pr={12}>
        <Label>{label}</Label>
        <Description>{description}</Description>
      </YStack>
      <Switch
        value={locked ? true : value}
        disabled={locked}
        onValueChange={locked ? undefined : onChange}
        trackColor={{ false: white850.val, true: primaryMain.val }}
        thumbColor={white600.val}
      />
    </Row>
  );
};

const Row = styled(XStack, {
  py: 16,
  items: 'center',
  justify: 'space-between'
});

const Label = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 21,
  color: '$black900',
  letterSpacing: -0.25
});

const Description = styled(Text, {
  fontSize: 13,
  fontWeight: '400',
  lineHeight: 18,
  color: '$black500',
  letterSpacing: -0.26
});
