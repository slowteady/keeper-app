import { useCallback, useState } from 'react';

import { useKakaoGeocodeMutation } from './mutation';
import { KakaoAddressDocumentDto } from './schema';

export const useAddressSearch = () => {
  const [searchedAddresses, setSearchedAddresses] = useState<KakaoAddressDocumentDto[]>();

  const { mutate, isPending } = useKakaoGeocodeMutation();

  const submitGeocode = useCallback(
    (value: string) => {
      if (value.trim().length === 0) return;

      mutate(
        { query: value },
        {
          onSuccess: ({ data }) => {
            setSearchedAddresses(data.documents);
          },
          onError: () => {
            setSearchedAddresses(undefined);
          }
        }
      );
    },
    [mutate]
  );

  const reset = useCallback(() => {
    setSearchedAddresses(undefined);
  }, []);

  return {
    searchedAddresses,
    isPending,
    submitGeocode,
    reset
  };
};
