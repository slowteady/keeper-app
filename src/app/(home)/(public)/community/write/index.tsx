import { FormProvider, useForm } from 'react-hook-form';
import { styled, View } from 'tamagui';

import { CommunityWriteTemplate } from '@/domains/community';

export interface CommunityWriteForm {
  animalType: string;
  gender: string;
  neuterYn: string;
  protectionType: string;
  vaccinationCheck: string;
  contact: { type: string; value: string }[];
}

const Page = () => {
  const methods = useForm<CommunityWriteForm>({
    defaultValues: {
      animalType: 'DOG',
      gender: 'NONE',
      neuterYn: 'NONE',
      protectionType: 'TEMPORARY',
      vaccinationCheck: 'NONE',
      contact: []
    }
  });

  return (
    <Container>
      <FormProvider {...methods}>
        <CommunityWriteTemplate />
      </FormProvider>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  bg: '$white900'
});
