let currentPathname = '/';

export const setCurrentPathname = (pathname: string) => {
  currentPathname = pathname;
};

export const getCurrentPathname = () => currentPathname;
