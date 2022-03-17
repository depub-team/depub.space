import { ISCNSignPayload } from '@likecoin/iscn-js';
import { OfflineSigner } from '@cosmjs/proto-signing';
import Debug from 'debug';
import { estimateArweavePrice, uploadToArweave } from './api';
import { sendLIKE } from '../likecoin';
import { signISCN } from '../iscn/sign';

const debug = Debug('web:arweave');

export async function submitToArweaveAndISCN(
  files: string | File[],
  iscnMetadata: ISCNSignPayload,
  signer: OfflineSigner,
  fromAddress: string
) {
  const estimate = await estimateArweavePrice(files);
  const {
    arweaveId: existingArweaveId,
    ipfsHash: existingIPFSHash,
    address,
    memo,
    LIKE,
  } = estimate;
  let arweaveId = existingArweaveId;
  let ipfsHash = existingIPFSHash;

  debug('submitToArweaveAndISCN() -> estimate: %O', estimate);

  if (!arweaveId) {
    const res = await sendLIKE(fromAddress, address, LIKE, signer, memo);

    ({ arweaveId, ipfsHash } = await uploadToArweave(files, res.transactionHash));
  }

  let { contentFingerprints = [] } = iscnMetadata;

  if (!contentFingerprints) contentFingerprints = [];
  if (ipfsHash) contentFingerprints.push(`ipfs://${ipfsHash}`);

  contentFingerprints.push(`ar://${arweaveId}`);

  debug('submitToArweaveAndISCN() -> contentFingerprints: %O', contentFingerprints);

  const iscnMetadataWithArweaveId = { ...iscnMetadata, contentFingerprints };
  const res = await signISCN(iscnMetadataWithArweaveId, signer, fromAddress);

  return res;
}

export default submitToArweaveAndISCN;
