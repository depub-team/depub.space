export const getSystemDarkMode = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const systemDarkMode =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (systemDarkMode) {
    return 'dark';
  }

  return 'light';
};
