import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';

import { useKakaoGeocodeMutation } from './mutation';
import { KakaoAddressDocumentDto } from './schema';

export const useLocationBottomSheet = (onSelect: (item: KakaoAddressDocumentDto) => void) => {
  const [address, setAddress] = useState<KakaoAddressDocumentDto>();
  const [searchedAddresses, setSearchedAddresses] = useState<KakaoAddressDocumentDto[]>();

  const ref = useRef<BottomSheetModal>(null);

  const { mutate, isPending } = useKakaoGeocodeMutation();

  const openBottomSheet = useCallback(() => {
    ref.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    if (ref.current) {
      ref.current.dismiss();
      setSearchedAddresses(undefined);
    }
  }, [ref]);

  const submitGeocode = useCallback(
    (value: string) => {
      if (value.trim().length === 0) return;

      mutate(
        { query: value },
        {
          onSuccess: ({ data }) => {
            const { documents } = data;
            setSearchedAddresses(documents);
          },
          onError: () => {}
        }
      );
    },
    [mutate]
  );

  const getAddress = (item: KakaoAddressDocumentDto) => {
    setAddress(item);
    onSelect?.(item);
    dismiss();
  };

  return {
    state: { address, searchedAddresses },
    refs: { ref },
    flags: { isPending },
    actions: { openBottomSheet, submitGeocode, getAddress, dismiss }
  };
};
