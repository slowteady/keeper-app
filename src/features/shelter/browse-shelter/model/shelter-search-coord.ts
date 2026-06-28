import { atom, useAtomValue, useSetAtom } from 'jotai';

type Coord = { latitude: number; longitude: number };

const shelterSearchCoordAtom = atom<Coord | null>(null);

export const useShelterSearchCoord = () => useAtomValue(shelterSearchCoordAtom);
export const useSetShelterSearchCoord = () => useSetAtom(shelterSearchCoordAtom);
