import { toBase64 } from '@cosmjs/encoding';
import { OfflineSigner } from '@cosmjs/proto-signing';
import type { Window as KeplrWindow } from '@keplr-wallet/types';
import { signMsg } from '../constants';

const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}

export const generateAuthSignature = async (offlineSigner: OfflineSigner) => {
  const account = (await offlineSigner.getAccounts())[0];
  const pubkey = toBase64(account.pubkey);

  // Sign message using Keplr.
  const res = await (offlineSigner as any).keplr.signArbitrary(
    PUBLIC_CHAIN_ID,
    account.address,
    signMsg
  );

  // Join signature and pubkey with dot and convert to base64
  return Buffer.from(`${res.signature}.${pubkey}`).toString('base64');
};
