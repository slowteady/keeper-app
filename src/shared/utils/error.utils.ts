import { AxiosError } from 'axios';

export const handleError = (error: unknown, msg: string): Error => {
  if (error instanceof AxiosError) {
    console.error(`${msg}: ${error.message}`);
    throw error;
  }
  console.error(error);
  throw error;
};
