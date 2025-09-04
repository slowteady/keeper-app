import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal } from 'react-native';

import { ModalContextType, OpenOptions } from './ModalProvider.types';

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const onDismissRef = useRef<(() => void) | undefined>(undefined);

  const open = useCallback((node: React.ReactNode, opts?: OpenOptions) => {
    onDismissRef.current = opts?.onDismiss;
    setContent(node);
    setVisible(true);
  }, []);
  const update = useCallback((node: React.ReactNode) => setContent(node), []);
  const close = useCallback(() => setVisible(false), []);

  const value = useMemo<ModalContextType>(() => ({ open, update, close }), [open, update, close]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal animationType="fade" visible={visible} onRequestClose={close} transparent>
        {content}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within <ModalProvider>');
  return ctx;
};
