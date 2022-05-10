import type { UserProfile, Message } from '../resolvers/generated_types';
import type { ISCNRecord } from '../interfaces';
import { getAuthorAddress } from './get-author-address.util';

export const transformRecord = (record: ISCNRecord, profile: UserProfile | null) => {
  const from = getAuthorAddress(record);
  const { data } = record;

  return {
    id: data['@id'] as string,
    message: data.contentMetadata.description,
    from,
    profile,
    date: new Date(data.contentMetadata.recordTimestamp || data.recordTimestamp).toISOString(),
    images: data.contentFingerprints
      .filter(c => /^ipfs/.test(c))
      .map(c => `https://cloudflare-ipfs.com/ipfs/${c.split('ipfs://')[1]}`),
  } as Message;
};
