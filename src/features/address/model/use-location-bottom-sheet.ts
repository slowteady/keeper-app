import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';

import { KakaoAddressDocumentDto } from './schema';
import { useAddressSearch } from './use-address-search';

export const useLocationBottomSheet = (onSelect: (item: KakaoAddressDocumentDto) => void) => {
  const [address, setAddress] = useState<KakaoAddressDocumentDto>();
  const { searchedAddresses, isPending, submitGeocode, reset } = useAddressSearch();

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

  const getAddress = (item: KakaoAddressDocumentDto) => {
    setAddress(item);
    onSelect?.(item);
    dismiss();
  };

  return {
    address,
    searchedAddresses,
    ref,
    isPending,
    openBottomSheet,
    submitGeocode,
    getAddress,
    dismiss
  };
};
