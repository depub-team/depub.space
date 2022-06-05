import type { UserProfile, Message } from '../resolvers/generated_types';
import type { ISCNRecord } from '../interfaces';

export const transformRecord = (
  authorAddress: string,
  record: ISCNRecord,
  profile?: UserProfile
) => {
  const { data } = record;

  return {
    id: data['@id'] as string,
    message: data.contentMetadata.description,
    from: authorAddress,
    profile,
    date: new Date(data.contentMetadata.recordTimestamp || data.recordTimestamp).toISOString(),
    images: data.contentFingerprints
      .filter(c => /^ipfs/.test(c))
      .map(c => `https://cloudflare-ipfs.com/ipfs/${c.split('ipfs://')[1]}`),
    isDeleted: data.contentMetadata?.isDeleted || false,
  } as Message;
};
