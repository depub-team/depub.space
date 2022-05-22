import { OfflineSigner } from '@cosmjs/proto-signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { BroadcastTxSuccess } from '@cosmjs/stargate';
import * as Crypto from 'expo-crypto';
import Debug from 'debug';
import { submitToArweaveAndISCN } from '../arweave';
import { signISCN, updateISCN } from './sign';

const debug = Debug('postMessage()');
const ISCN_FINGERPRINT = process.env.NEXT_PUBLIC_ISCN_FINGERPRINT || '';

async function genPayload(authorAddress: string, message: string, version = 1, isDeleted = false) {
  const recordTimestamp = new Date().toISOString();
  const datePublished = recordTimestamp.split('T')[0];
  const messageSha256Hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    message
  );

  return {
    contentFingerprints: [ISCN_FINGERPRINT, `hash://sha256/${messageSha256Hash}`],
    recordTimestamp,
    datePublished,
    stakeholders: [
      {
        entity: {
          '@id': authorAddress,
          name: authorAddress,
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
    author: authorAddress,
    description: message,
    isDeleted,
    version,
    usageInfo: 'https://creativecommons.org/licenses/by/4.0',
  };
}

export const postMessage = async (
  offlineSigner: OfflineSigner,
  message: string,
  files?: string | File[] // FIXME: should only supports one file
) => {
  debug('message: %s, files: %O', message, files);

  const [wallet] = await offlineSigner.getAccounts();

  const payload = await genPayload(wallet.address, message)

  debug('postMessage() -> payload: %O', payload);

  let txn: TxRaw | BroadcastTxSuccess;

  if (files) {
    txn = await submitToArweaveAndISCN(files, payload, offlineSigner, wallet.address);
  } else {
    txn = await signISCN(payload, offlineSigner, wallet.address);
  }

  return txn;
};

export const deleteMessage = async(
  offlineSigner: OfflineSigner,
  iscnId: string,
  originalMessage='',
  version=1,
) => {
  const [wallet] = await offlineSigner.getAccounts();
  const payload = await genPayload(wallet.address, originalMessage, version+1, true)

  const txn: TxRaw | BroadcastTxSuccess = await updateISCN(payload, iscnId, offlineSigner, wallet.address)

  return txn
}
