export const checkIsNFTProfilePicture = (profilePicProvider: string | undefined): boolean =>
  typeof profilePicProvider !== 'undefined' &&
  ['stargaze', 'omniflix'].includes(profilePicProvider);
