import * as Sentry from '@sentry/react-native';

import { clearUserContext, setUserContext } from './handle-sentry';

jest.mock('@sentry/react-native', () => ({
  setUser: jest.fn()
}));

const mockedSetUser = jest.mocked(Sentry.setUser);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('setUserContext', () => {
  it('id 를 string 으로 변환하고 email/username/nickname 을 그대로 전달', () => {
    setUserContext({
      id: '42',
      name: 'Lee',
      nickname: 'keeper',
      email: 'a@b.com'
    });

    expect(mockedSetUser).toHaveBeenCalledWith({
      id: '42',
      email: 'a@b.com',
      username: 'Lee',
      nickname: 'keeper'
    });
  });
});

describe('clearUserContext', () => {
  it('Sentry.setUser(null) 호출', () => {
    clearUserContext();

    expect(mockedSetUser).toHaveBeenCalledWith(null);
  });
});
