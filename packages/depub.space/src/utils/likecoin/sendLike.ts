import { OfflineSigner } from '@cosmjs/proto-signing';
import { assertIsBroadcastTxSuccess, SigningStargateClient } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';
import Debug from 'debug';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '';
const COSMOS_DENOM = process.env.NEXT_PUBLIC_COSMOS_DENOM || '';
const DEFAULT_GAS_PRICE = [{ amount: 1000, denom: COSMOS_DENOM }];
const DEFAULT_GAS_PRICE_NUMBER = DEFAULT_GAS_PRICE[0].amount;
const TRANSFER_GAS = 100000;
const debug = Debug('web:sendLike');

export const DEFAULT_TRANSFER_FEE = {
  gas: TRANSFER_GAS.toString(),
  amount: [
    {
      amount: new BigNumber(TRANSFER_GAS).multipliedBy(DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
      denom: COSMOS_DENOM,
    },
  ],
};

export async function sendLIKE(
  fromAddress: string,
  toAddress: string,
  amount: string,
  signer: OfflineSigner,
  memo: string
) {
  debug(
    'sendLike() -> fromAddress: %s, toAddress: %s, amount: %s, signer: %O, memo: %s, DEFAULT_TRANSFER_FEE: %O',
    fromAddress,
    toAddress,
    amount,
    signer,
    memo,
    DEFAULT_TRANSFER_FEE
  );

  const client = await SigningStargateClient.connectWithSigner(RPC_ENDPOINT, signer);
  const coins = [{ amount: new BigNumber(amount).shiftedBy(9).toFixed(0, 0), denom: COSMOS_DENOM }];
  const res = await client.sendTokens(fromAddress, toAddress, coins, DEFAULT_TRANSFER_FEE, memo);

  debug('sendLike() -> res: %O', res);

  assertIsBroadcastTxSuccess(res);

  return res;
}
