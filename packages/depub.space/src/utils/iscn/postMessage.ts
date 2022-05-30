import { OfflineSigner } from '@cosmjs/proto-signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { DeliverTxResponse } from '@cosmjs/stargate';
import * as Crypto from 'expo-crypto';
import Debug from 'debug';
import { submitToArweaveAndISCN } from '../arweave';
import { signISCN } from './sign';

const debug = Debug('postMessage()');
const ISCN_FINGERPRINT = process.env.NEXT_PUBLIC_ISCN_FINGERPRINT || '';

export const postMessage = async (
  offlineSigner: OfflineSigner,
  message: string,
  files?: string | File[] // FIXME: should only supports one file
) => {
  debug('message: %s, files: %O', message, files);

  const [wallet] = await offlineSigner.getAccounts();
  const recordTimestamp = new Date().toISOString();
  const datePublished = recordTimestamp.split('T')[0];
  const messageSha256Hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    message
  );
  const payload = {
    contentFingerprints: [ISCN_FINGERPRINT, `hash://sha256/${messageSha256Hash}`],
    recordTimestamp,
    datePublished,
    stakeholders: [
      {
        entity: {
          '@id': wallet.address,
          name: wallet.address,
        },
        contributionType: 'http://schema.org/author',
        rewardProportion: 0.975,
      },
      {
        entity: {
          '@id': 'https://depub.space',
          name: 'depub.space',
        },
        contributionType: 'http://schema.org/publisher',
        rewardProportion: 0.025,
      },
    ],
    name: `depub.space-${recordTimestamp}`,
    recordNotes: 'A Message posted on depub.space',
    type: 'Article',
    author: wallet.address,
    description: message,
    version: 1,
    usageInfo: 'https://creativecommons.org/licenses/by/4.0',
  };

  debug('postMessage() -> payload: %O', payload);

  let txn: TxRaw | DeliverTxResponse;

  if (files) {
    txn = await submitToArweaveAndISCN(files, payload, offlineSigner, wallet.address);
  } else {
    txn = await signISCN(payload, offlineSigner, wallet.address);
  }

  return txn;
};
