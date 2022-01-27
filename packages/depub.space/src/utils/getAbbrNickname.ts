export const getAbbrNickname = (nickname: string) =>
  `${nickname.replace(/^(cosmos|like1)/, '')[0]}${nickname[nickname.length - 1]}`;
