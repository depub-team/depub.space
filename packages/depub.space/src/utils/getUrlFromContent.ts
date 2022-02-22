export const getUrlFromContent = (content: string): string | null => {
  const matches = content.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
  );

  if (matches) {
    return matches[0];
  }

  return null;
};
