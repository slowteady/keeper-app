import { atom, useAtom, useSetAtom } from 'jotai';

const isAuthenticatedAtom = atom(false);

export const useIsAuthenticated = () => useAtom(isAuthenticatedAtom);
export const useSetIsAuthenticated = () => useSetAtom(isAuthenticatedAtom);
