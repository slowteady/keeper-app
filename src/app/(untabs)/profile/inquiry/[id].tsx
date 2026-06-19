import { Stack, useLocalSearchParams } from 'expo-router';

import { NavigateHeader, RouteErrorBoundary } from '@/shared/ui';
import { InquiryDetailScene } from '@/widgets/profile';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;

  return (
    <>
      <Stack.Screen options={{ header: () => <NavigateHeader text="문의 상세" /> }} />
      <InquiryDetailScene id={id} />
    </>
  );
};

export default Page;
