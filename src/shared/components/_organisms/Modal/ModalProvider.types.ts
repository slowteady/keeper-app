export type OpenOptions = {
  onDismiss?: () => void;
};
export type ModalContextType = {
  open: (node: React.ReactNode, opts?: OpenOptions) => void;
  update: (node: React.ReactNode) => void;
  close: () => void;
};
