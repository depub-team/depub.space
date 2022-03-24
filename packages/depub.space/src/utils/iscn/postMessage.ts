import { OfflineSigner } from '@cosmjs/proto-signing';
import Debug from 'debug';
import { uploadToArweaveAndCreateISCN } from '../arweave';
import { composeMessagePayload } from './composeMessagePayload';
import { getSigningClient } from './getSigningClient';

const debug = Debug('postMessage()');

export const postMessage = async (
  offlineSigner: OfflineSigner,
  message: string,
  files?: string | File[]
) => {
  debug('message: %s, files: %O', message, files);

  const [wallet] = await offlineSigner.getAccounts();
  const payload = await composeMessagePayload(wallet.address, message);
  const signingClient = await getSigningClient(offlineSigner);

  debug('postMessage() -> payload: %O', payload);

  if (files) {
    const { arweaveId, ipfsHash } = await uploadToArweaveAndCreateISCN(
      files,
      offlineSigner,
      wallet.address
    );

    // add uploaded file hash into contentFingerprints
    payload.contentFingerprints.push(`ipfs://${ipfsHash}`, `ar://${arweaveId}`);
  }

  const txn = await signingClient.createISCNRecord(wallet.address, payload, {
    memo: 'depub.space',
  });

  return txn;
};
