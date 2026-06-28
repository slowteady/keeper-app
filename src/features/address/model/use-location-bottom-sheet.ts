import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';

import { KakaoKeywordDocumentDto } from './schema';
import { useKeywordSearch } from './use-keyword-search';

export const useLocationBottomSheet = (onSelect: (item: KakaoKeywordDocumentDto) => void) => {
  const { results, isPending, keyword, setKeyword, reset, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useKeywordSearch();

  const ref = useRef<BottomSheetModal>(null);

  const openBottomSheet = useCallback(() => {
    ref.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    if (ref.current) {
      ref.current.dismiss();
      reset();
    }
  }, [reset]);

  const getAddress = (item: KakaoKeywordDocumentDto) => {
    onSelect?.(item);
    dismiss();
  };

  return {
    results,
    ref,
    isPending,
    keyword,
    setKeyword,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    openBottomSheet,
    getAddress,
    dismiss
  };
};
