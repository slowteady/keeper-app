import { BottomSheetModal } from '@gorhom/bottom-sheet';

export type PresentOptions = {
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
};

export type BottomSheetContextType = {
  present: (node: React.ReactNode, opts?: PresentOptions) => void;
  update: (node: React.ReactNode) => void;
  dismiss: () => void;
  setSnapPoints: (pts: (string | number)[]) => void;
  ref: React.RefObject<BottomSheetModal | null>;
};
