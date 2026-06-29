import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from 'react-native';
import { Spinner, styled, Text, View, YStack } from 'tamagui';

export type LoadingOverlayContextType = {
  show: (message?: string) => void;
  hide: () => void;
};

const LoadingOverlayContext = createContext<LoadingOverlayContextType | null>(null);

export const LoadingOverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const show = useCallback((msg?: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);
  const hide = useCallback(() => setVisible(false), []);

  const value = useMemo<LoadingOverlayContextType>(() => ({ show, hide }), [show, hide]);

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      <Modal animationType="fade" visible={visible} transparent onRequestClose={noop}>
        <Overlay>
          <Box gap={12} items="center">
            <Spinner size="large" color="$primaryMain" />
            {message && <Message>{message}</Message>}
          </Box>
        </Overlay>
      </Modal>
    </LoadingOverlayContext.Provider>
  );
};

export const useLoadingOverlay = () => {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) throw new Error('useLoadingOverlay must be used within <LoadingOverlayProvider>');
  return ctx;
};

const noop = () => {};

const Overlay = styled(View, {
  flex: 1,
  bg: 'rgba(0, 0, 0, 0.4)',
  justify: 'center',
  items: 'center'
});

const Box = styled(YStack, {
  bg: '$white900',
  rounded: 16,
  px: 28,
  py: 24
});

const Message = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  color: '$black700',
  letterSpacing: -0.25
});
