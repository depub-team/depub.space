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
      .filter(c => /^ar/.test(c))
      .map(c => `https://arweave.net/${c.split('ar://')[1]}`),
  } as Message;
};
