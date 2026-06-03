import { useCallback, useState } from 'react';

import { useKakaoKeywordMutation } from './mutation';
import { KakaoKeywordDocumentDto } from './schema';

export const useKeywordSearch = () => {
  const [results, setResults] = useState<KakaoKeywordDocumentDto[]>();

  const { mutate, isPending } = useKakaoKeywordMutation();

  const submitSearch = useCallback(
    (value: string) => {
      if (value.trim().length === 0) return;

      mutate(
        { query: value },
        {
          onSuccess: ({ data }) => {
            setResults(data.documents);
          },
          onError: () => {
            setResults(undefined);
          }
        }
      );
    },
    [mutate]
  );

  const reset = useCallback(() => {
    setResults(undefined);
  }, []);

  return {
    results,
    isPending,
    submitSearch,
    reset
  };
};
