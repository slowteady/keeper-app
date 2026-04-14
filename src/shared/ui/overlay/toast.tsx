import { Toast as TamaguiToast, ToastViewport, useToastController, useToastState } from '@tamagui/toast';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'tamagui';

import { setToastRef } from '@/shared/lib';

export const Toast = () => {
  const { left, top, right } = useSafeAreaInsets();
  const toast = useToastState();
  const { show } = useToastController();

  useEffect(() => {
    setToastRef(show);
  }, [show]);

  if (!toast || toast.isHandledNatively) {
    return null;
  }

  const hasStatus = !!toast.customData?.status;

  return (
    <>
      <StyledToast
        key={toast.id}
        animation="quick"
        duration={toast.duration || 2000}
        enterStyle={{ transform: [{ translateY: -40 }], opacity: 0 }}
        exitStyle={{ transform: [{ translateY: -40 }], opacity: 0 }}
        transform={[{ translateY: 0 }]}
        viewportName={toast.viewportName}
      >
        {hasStatus && <AnimatedIcon status={toast.customData?.status} />}
        {toast.title && <StyledTitle>{toast.title}</StyledTitle>}
        {toast.message && <TamaguiToast.Description>{toast.message}</TamaguiToast.Description>}
      </StyledToast>

      <ToastViewport right={right} left={left} top={top} px={20} />
    </>
  );
};

const ICON_CONFIG = {
  success: {
    source: require('@/assets/animations/success2.json'),
    style: { marginRight: 8, width: 32, height: 32 }
  },
  fail: {
    source: require('@/assets/animations/fail2.json'),
    style: { marginRight: 8, width: 24, height: 24 }
  }
} as const;

const AnimatedIcon = ({ status }: { status?: 'success' | 'fail' }) => {
  if (!status) return null;

  return <LottieView autoPlay loop={false} {...ICON_CONFIG[status]} />;
};

const StyledToast = styled(TamaguiToast, {
  opacity: 1,
  scale: 1,
  height: 48,
  rounded: '$3',
  flexDirection: 'row',
  items: 'center',
  justify: 'center',
  bg: '$black900',
  minW: '100%'
});

const StyledTitle = styled(TamaguiToast.Title, {
  fontWeight: '$5',
  fontSize: 14,
  color: '$white900'
});
