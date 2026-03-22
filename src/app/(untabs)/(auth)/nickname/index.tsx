import { NicknameForm } from '@/entities/auth';
import { useCurrentUser } from '@/features/auth';

const Page = () => {
  const { data } = useCurrentUser();

  return (
    <NicknameForm
      title={'어떤 닉네임으로\n변경할까요?'}
      buttonText="등록하기"
      onSubmit={() => {}}
      isPending={false}
      initialValue={data.user?.nickname}
    />
  );
};

export default Page;
