import { fakerKO } from '@faker-js/faker';

import { UserDto } from '@/entities';

export const getUserValue = (): UserDto => {
  return {
    id: fakerKO.string.uuid(),
    name: fakerKO.person.fullName(),
    nickname: fakerKO.person.fullName(),
    email: fakerKO.internet.email(),
    image: fakerKO.image.avatar()
  };
};
