import { OfflineSigner } from '@cosmjs/proto-signing';
import Debug from 'debug';
import { composeMessagePayload } from './composeMessagePayload';
import { getSigningClient } from './getSigningClient';

const debug = Debug('updateMessage()');

export const updateMessage = async (
  offlineSigner: OfflineSigner,
  iscnId: string,
  message: string,
  files?: string | File[]
) => {
  debug('message: %s, files: %O', message, files);

  const [wallet] = await offlineSigner.getAccounts();
  const payload = await composeMessagePayload(wallet.address, message);

  debug('updateMessage() -> payload: %O', payload);

  const signingClient = await getSigningClient(offlineSigner);
  const txn = await signingClient.updateISCNRecord(wallet.address, iscnId, payload, {
    memo: 'depub.space',
  });

  return txn;
};
