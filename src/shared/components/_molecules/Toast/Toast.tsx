import { Toast as TamaguiToast, ToastViewport, useToastState } from '@tamagui/toast';
import LottieView from 'lottie-react-native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'tamagui';

export const Toast = () => {
  const { left, top, right } = useSafeAreaInsets();
  const toast = useToastState();

  if (!toast || toast.isHandledNatively) {
    return null;
  }

  const hasStatus = !!toast.customData?.status;

  return (
    <>
      <StyledToast
        key={toast.id}
        duration={toast.duration || 2000}
        enterStyle={{ opacity: 0, transform: [{ translateY: 0 }] }}
        exitStyle={{ opacity: 0, transform: [{ translateY: 0 }] }}
        transform={[{ translateY: top }]}
        viewportName={toast.viewportName}
      >
        {hasStatus && <AnimatedIcon status={toast.customData?.status} />}
        {toast.title && <StyledTitle>{toast.title}</StyledTitle>}
        {toast.message && <TamaguiToast.Description>{toast.message}</TamaguiToast.Description>}
      </StyledToast>

      <ToastViewport right={right} left={left} px={20} />
    </>
  );
};

const AnimatedIcon = ({ status }: { status?: 'success' | 'fail' }) => {
  if (!status) return null;

  const getProps = useCallback((status: 'success' | 'fail') => {
    if (status === 'success') {
      return {
        source: require(`@/assets/animations/success2.json`),
        style: { marginRight: 8, width: 32, height: 32 }
      };
    } else if (status === 'fail') {
      return {
        source: require(`@/assets/animations/fail2.json`),
        style: { marginRight: 8, width: 24, height: 24 }
      };
    }
  }, []);

  return <LottieView autoPlay loop={false} {...getProps(status)} />;
};

const StyledToast = styled(TamaguiToast, {
  animation: '200ms',
  opacity: 1,
  scale: 1,
  height: 48,
  rounded: '$3',
  display: 'flex',
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
