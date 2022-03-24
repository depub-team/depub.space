import { OfflineSigner } from '@cosmjs/proto-signing';
import Debug from 'debug';
import { estimateArweavePrice, uploadToArweave } from './api';
import { sendLIKE } from '../likecoin';

const debug = Debug('web:arweave');

export const uploadToArweaveAndCreateISCN = async (
  files: string | File[],
  signer: OfflineSigner,
  fromAddress: string
) => {
  const estimate = await estimateArweavePrice(files);
  const {
    // always upload new file
    // existingArweaveId,
    // existingIPFSHash,
    address,
    memo,
    LIKE,
  } = estimate;

  debug('uploadToArweaveAndCreateISCN() -> estimate: %O', estimate);

  const res = await sendLIKE(fromAddress, address, LIKE, signer, memo);
  const { arweaveId, ipfsHash } = await uploadToArweave(files, res.transactionHash);

  return { arweaveId, ipfsHash };
};
