import { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { AminoTypes, SigningStargateClient } from '@cosmjs/stargate';
import { ISCNSigningClient } from '@likecoin/iscn-js';
import {
  MsgCreateIscnRecord,
  MsgUpdateIscnRecord,
} from '@likecoin/iscn-message-types/dist/iscn/tx';

let client: ISCNSigningClient | null = null;
const PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '';

export async function getSigningClient(signer: OfflineSigner) {
  if (!client) {
    const c = new ISCNSigningClient();

    await c.connect(PUBLIC_RPC_ENDPOINT);
    client = c;
  }

  await client.connectWithSigner(PUBLIC_RPC_ENDPOINT, signer);

  const isSignDirectSigner = typeof (signer as OfflineDirectSigner).signDirect === 'function';

  // XXX: hacky way to inject additions into AminoTypes
  if (!isSignDirectSigner) {
    const signingStargateClient: SigningStargateClient = (client as any).signingClient;

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
        '/likechain.iscn.MsgUpdateIscnRecord': {
          aminoType: 'likecoin-chain/MsgUpdateIscnRecord',
          toAmino: ({ from, record, iscnId }: MsgUpdateIscnRecord) => ({
            from,
            iscnId,
            record: {
              ...record,
              stakeholders: record?.stakeholders.map(s => JSON.parse(s.toString())),
              contentMetadata: JSON.parse(record?.contentMetadata.toString() || '{}'),
            },
          }),
          fromAmino: ({ from, record, iscnId }): MsgUpdateIscnRecord => ({
            from,
            iscnId,
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

  return client;
}
