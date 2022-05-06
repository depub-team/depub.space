import { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { AminoTypes, BroadcastTxSuccess, SigningStargateClient } from '@cosmjs/stargate';
import { ISCNSigningClient, ISCNSignPayload } from '@likecoin/iscn-js';
import { MsgCreateIscnRecord } from '@likecoin/iscn-message-types/dist/iscn/tx';

const PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '';

let client: ISCNSigningClient | null = null;

export async function getSigningClient() {
  if (!client) {
    const c = new ISCNSigningClient();

    await c.connect(PUBLIC_RPC_ENDPOINT);
    client = c;
  }

  return client;
}

export async function signISCN(tx: ISCNSignPayload, signer: OfflineSigner, address: string) {
  const signingClient = await getSigningClient();
  const isSignDirectSigner = typeof (signer as OfflineDirectSigner).signDirect === 'function';

  await signingClient.connectWithSigner(PUBLIC_RPC_ENDPOINT, signer);

  // XXX: hacky way to inject additions into AminoTypes
  if (!isSignDirectSigner) {
    const signingStargateClient: SigningStargateClient = (signingClient as any).signingClient;

    (signingStargateClient as any).aminoTypes = new AminoTypes({
      prefix: 'like',
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

  const res = await signingClient.createISCNRecord(address, tx, { memo: 'depub.space' });

  return res as BroadcastTxSuccess;
}
