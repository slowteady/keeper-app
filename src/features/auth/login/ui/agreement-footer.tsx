import { View } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button } from '@/shared/ui';

type AgreementFooterProps = {
  allRequiredAgreed: boolean;
  onSubmit: () => void;
  isPending?: boolean;
};

export const AgreementFooter = ({ allRequiredAgreed, onSubmit, isPending }: AgreementFooterProps) => {
  const { bottom } = useLayout();

  return (
    <View pt={8} pb={bottom || 16}>
      <Button
        size="large"
        style={{ borderRadius: 10 }}
        onPress={onSubmit}
        disabled={!allRequiredAgreed || isPending}
        isLoading={isPending}
        testID="login-agreement-confirm"
      >
        동의하고 시작하기
      </Button>
    </View>
  );
};
