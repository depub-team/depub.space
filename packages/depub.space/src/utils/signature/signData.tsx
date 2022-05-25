import { AminoMsg, makeSignDoc as makeSignDocAmino, StdFee, makeStdTx } from '@cosmjs/amino';
import { toBase64 } from '@cosmjs/encoding';
import { isOfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { assert } from '@cosmjs/utils';

const equals = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export interface MsgSignData extends AminoMsg {
  readonly type: 'sign/MsgSignData';
  readonly value: {
    /** Bech32 account address */
    signer: string;
    /** Base64 encoded data */
    data: string;
  };
}

export const signData = async (
  signer: OfflineSigner,
  signerAddress: string,
  data: Uint8Array | Uint8Array[]
): Promise<any> => {
  const accountNumber = 0;
  const sequence = 0;
  const chainId = '';
  const fee: StdFee = {
    gas: '0',
    amount: [],
  };
  const memo = '';

  const datas = Array.isArray(data) ? data : [data];

  const msgs: MsgSignData[] = datas.map(
    (d): MsgSignData => ({
      type: 'sign/MsgSignData',
      value: {
        signer: signerAddress,
        data: toBase64(d),
      },
    })
  );

  assert(!isOfflineDirectSigner(signer));
  const accountFromSigner = (await signer.getAccounts()).find(
    account => account.address === signerAddress
  );

  if (!accountFromSigner) {
    throw new Error('Failed to retrieve account from signer');
  }

  const signDoc = makeSignDocAmino(msgs, fee, chainId, memo, accountNumber, sequence);
  const { signature, signed } = await signer.signAmino(signerAddress, signDoc);

  if (!equals(signDoc, signed)) {
    throw new Error(
      'The signed document differs from the signing instruction. This is not supported for ADR-036.'
    );
  }

  return makeStdTx(signDoc, signature);
};
