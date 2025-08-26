import { atomWithReset } from 'jotai/utils';

import { UserDto } from '../types/user.types';

export const userAtom = atomWithReset<UserDto>({
  id: '',
  name: '',
  nickname: '',
  email: '',
  image: ''
});
