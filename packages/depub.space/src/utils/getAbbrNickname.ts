export const getAbbrNickname = (nickname: string) =>
  `${nickname.replace(/^(cosmos1|like1)/, '')[0]}${nickname[nickname.length - 1]}`;
