import { QueryClient, setupBankExtension } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import BigNumber from 'bignumber.js';
import Debug from 'debug';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '';
const COSMOS_DENOM = process.env.NEXT_PUBLIC_COSMOS_DENOM || '';
const debug = Debug('web:getLikecoinBalance');

export class AccountNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountNotFoundError';
  }
}

export async function getLikeCoinBalance(address: string) {
  debug('getLikeCoinBalance() -> address: %s', address);

  const queryClient = QueryClient.withExtensions(
    await Tendermint34Client.connect(RPC_ENDPOINT),
    setupBankExtension
  );

  try {
    const balances = await queryClient.bank.allBalances(address);
    const likecoinBalance = balances.find(b => b.denom === COSMOS_DENOM)?.amount;

    if (likecoinBalance) {
      const likecoinBalanceBN = new BigNumber(likecoinBalance);

      return likecoinBalanceBN.dividedBy(1e9).toFixed();
    }

    return 0;
  } catch (ex) {
    if (ex.message.includes('invalid address')) {
      throw new AccountNotFoundException('account not found');
    }

    throw ex;
  }
}
