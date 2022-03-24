import { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { AminoTypes, BroadcastTxSuccess, SigningStargateClient } from '@cosmjs/stargate';
import { ISCNSignPayload } from '@likecoin/iscn-js';
import { MsgCreateIscnRecord } from '@likecoin/iscn-message-types/dist/iscn/tx';
import { getSigningClient } from './getSigningClient';

export async function createISCN(payload: ISCNSignPayload, signer: OfflineSigner, address: string) {
  const signingClient = await getSigningClient(signer);
  const isSignDirectSigner = typeof (signer as OfflineDirectSigner).signDirect === 'function';

  // XXX: hacky way to inject additions into AminoTypes
  if (!isSignDirectSigner) {
    const signingStargateClient: SigningStargateClient = (signingClient as any).signingClient;

    (signingStargateClient as any).aminoTypes = new AminoTypes({
      prefix: 'cosmos',
      additions: {
        '/likechain.iscn.MsgCreateIscnRecord': {
          aminoType: 'likecoin-chain/MsgCreateIscnRecord',
          toAmino: ({ from, record }: MsgCreateIscnRecord) => ({
            from,
            record: {
              ...record,
              stakeholders: record?.stakeholders.map(s => JSON.parse(s.toString())),
              contentMetadata: JSON.parse(record?.contentMetadata.toString() || '{}'),
            },
          }),
          fromAmino: ({ from, record }): MsgCreateIscnRecord => ({
            from,
            record: {
              ...record,
              stakeholders: record?.stakeholders.map((s: string) =>
                Buffer.from(JSON.stringify(s), 'utf8')
              ),
              contentMetadata: Buffer.from(JSON.stringify(record?.contentMetadata || {}), 'utf8'),
            },
          }),
        },
      },
    });
  }

  const res = await signingClient.createISCNRecord(address, payload, { memo: 'depub.space' });

  return res as BroadcastTxSuccess;
}
