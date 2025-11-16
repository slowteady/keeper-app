import { RefObject } from 'react';
import { FlatList, ScrollView } from 'react-native';

type ScrollRef = RefObject<FlatList<any> | ScrollView>;

const scrollRefs: Record<string, ScrollRef | null> = {};

export const registerTabScrollRef = (name: string, ref: ScrollRef) => {
  scrollRefs[name] = ref;
};

export const scrollToTop = (name: string) => {
  const ref = scrollRefs[name];
  if (!ref?.current) return;

  if ('scrollToOffset' in ref.current) {
    ref.current.scrollToOffset({ offset: 0, animated: true });
  } else {
    ref.current.scrollTo({ y: 0, animated: true });
  }
};
