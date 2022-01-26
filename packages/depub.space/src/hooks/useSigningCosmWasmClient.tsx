import { useState } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import Debug from 'debug';

const debug = Debug('web:useSigningCosmWasmClient');
const PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '';
const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '';
const isTestnet = /testnet/.test(PUBLIC_CHAIN_ID);

export interface ISigningCosmWasmClientContext {
  walletAddress: string;
  signingClient: SigningCosmWasmClient | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
}

export const getChainInfo = () => {
  const mainnet = {
    chainId: 'likecoin-mainnet-2',
    chainName: 'LikeCoin chain',
    rpc: 'https://mainnet-node.like.co/rpc/',
    rest: 'https://mainnet-node.like.co',
    stakeCurrency: {
      coinDenom: 'LIKE',
      coinMinimalDenom: 'nanolike',
      coinDecimals: 9,
      coinGeckoId: 'likecoin',
    },
    walletUrlForStaking: 'https://stake.like.co',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'cosmos',
      bech32PrefixAccPub: 'cosmospub',
      bech32PrefixValAddr: 'cosmosvaloper',
      bech32PrefixValPub: 'cosmosvaloperpub',
      bech32PrefixConsAddr: 'cosmosvalcons',
      bech32PrefixConsPub: 'cosmosvalconspub',
    },
    currencies: [
      {
        coinDenom: 'LIKE',
        coinMinimalDenom: 'nanolike',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LIKE',
        coinMinimalDenom: 'nanolike',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 1,
      average: 10,
      high: 1000,
    },
    features: ['stargate', 'ibc-transfer'],
  };

  const testnet = {
    chainId: 'likecoin-public-testnet-3',
    chainName: 'LikeCoin public test chain',
    rpc: 'https://likecoin-public-testnet-rpc.nnkken.dev/',
    rest: 'https://likecoin-public-testnet-lcd.nnkken.dev/',
    stakeCurrency: {
      coinDenom: 'EKIL',
      coinMinimalDenom: 'nanoekil',
      coinDecimals: 9,
      coinGeckoId: 'likecoin',
    },
    walletUrlForStaking: 'https://stake.like.co',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'cosmos',
      bech32PrefixAccPub: 'cosmospub',
      bech32PrefixValAddr: 'cosmosvaloper',
      bech32PrefixValPub: 'cosmosvaloperpub',
      bech32PrefixConsAddr: 'cosmosvalcons',
      bech32PrefixConsPub: 'cosmosvalconspub',
    },
    currencies: [
      {
        coinDenom: 'EKIL',
        coinMinimalDenom: 'nanoekil',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'EKIL',
        coinMinimalDenom: 'nanoekil',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0.01,
      average: 1,
      high: 1000,
    },
  };

  return isTestnet ? testnet : mainnet;
};

const suggestChain = async () => {
  await (window as any).keplr.experimentalSuggestChain(getChainInfo());
};

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [walletAddress, setWalletAddress] = useState('');
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    debug('connectWallet()');

    setIsLoading(true);

    try {
      // suggest likechain
      await suggestChain();

      // enable website to access kepler
      await (window as any).keplr.enable(PUBLIC_CHAIN_ID);

      // get offline signer for signing txs
      const offlineSigner = await (window as any).getOfflineSigner(PUBLIC_CHAIN_ID);

      // make client
      const client = await SigningCosmWasmClient.connectWithSigner(
        PUBLIC_RPC_ENDPOINT,
        offlineSigner
      );

      setSigningClient(client);

      // get user address
      const [{ address }] = await offlineSigner.getAccounts();

      setWalletAddress(address);

      setIsLoading(false);
    } catch (ex) {
      setError(ex.message);
    }
  };

  const disconnect = () => {
    debug('disconnect()');

    if (signingClient) {
      signingClient.disconnect();
    }

    setWalletAddress('');
    setSigningClient(null);
    setIsLoading(false);
  };

  return {
    walletAddress,
    signingClient,
    isLoading,
    error,
    connectWallet,
    disconnect,
  };
};
