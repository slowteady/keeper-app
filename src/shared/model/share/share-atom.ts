import { atom, useAtomValue, useSetAtom } from 'jotai';

const isSharingAtom = atom(false);

export const useIsSharing = () => useAtomValue(isSharingAtom);
export const useSetIsSharing = () => useSetAtom(isSharingAtom);
