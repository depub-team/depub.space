import { ISCNSigningClient, ISCNSignPayload } from '@likecoin/iscn-js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import Debug from 'debug';
import { estimateArweavePrice, uploadToArweave } from './api';
import { sendLIKE } from '../sendLike';

const debug = Debug('web:arweave');
const signingClient = new ISCNSigningClient();

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

  await signingClient.setSigner(signer);

  const res = await signingClient.createISCNRecord(fromAddress, iscnMetadataWithArweaveId);

  return res;
}

export default submitToArweaveAndISCN;
