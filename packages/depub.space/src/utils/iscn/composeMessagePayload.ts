import * as Crypto from 'expo-crypto';
import Debug from 'debug';
import { ISCNSignPayload } from '@likecoin/iscn-js';

const debug = Debug('composeMessagePayload()');
const ISCN_FINGERPRINT = process.env.NEXT_PUBLIC_ISCN_FINGERPRINT || '';

export const composeMessagePayload = async (
  from: string,
  message: string
): Promise<ISCNSignPayload> => {
  const recordTimestamp = new Date().toISOString();
  const datePublished = recordTimestamp.split('T')[0];
  const messageSha256Hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    message
  );
  const payload: ISCNSignPayload = {
    contentFingerprints: [ISCN_FINGERPRINT, `hash://sha256/${messageSha256Hash}`],
    recordTimestamp,
    datePublished,
    stakeholders: [
      {
        entity: {
          '@id': from,
          name: from,
        },
        contributionType: 'http://schema.org/author',
        rewardProportion: 0.975,
      },
      {
        entity: {
          '@id': 'https://depub.SPACE',
          name: 'depub.SPACE',
        },
        contributionType: 'http://schema.org/publisher',
        rewardProportion: 0.025,
      },
    ],
    name: `depub.space-${recordTimestamp}`,
    recordNotes: 'A Message posted on depub.SPACE',
    type: 'Article',
    author: from,
    description: message,
    version: 1,
    usageInfo: 'https://creativecommons.org/licenses/by/4.0',
  };

  debug('payload: %O', payload);

  return payload;
};
