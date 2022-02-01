import { useEffect, useState } from 'react';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import Debug from 'debug';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { payloadId } from '@walletconnect/utils';
import { AccountData, OfflineSigner } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { DesmosProfile, fetchDesmosProfile } from '../utils';

const debug = Debug('web:useSigningCosmWasmClient');
const PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '';
const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '';
const KEY_WALLET_CONNECT_ACCOUNT_PREFIX = 'KEY_WALLET_CONNECT_ACCOUNT_PREFIX';
const KEY_WALLET_CONNECT = 'walletconnect';
const KEY_CONNECTED_WALLET_TYPE = 'KEY_CONNECTED_WALLET_TYPE';
const isTestnet = /testnet/.test(PUBLIC_CHAIN_ID);

type ConnectedWalletType = 'keplr' | 'likerland_app';

export interface ISigningCosmWasmClientContext {
  walletAddress: string | null;
  profile: DesmosProfile | null;
  signingClient: SigningCosmWasmClient | null;
  offlineSigner: OfflineSigner | null;
  isLoading: boolean;
  error: string | null;
  connectKeplr: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
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

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const [offlineSigner, setOfflineSigner] = useState<OfflineSigner | null>(null);
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org',
    qrcodeModal: QRCodeModal,
    qrcodeModalOptions: {
      desktopLinks: [],
      mobileLinks: [],
    },
  });

  const suggestChain = async () => {
    if (typeof (window as any).keplr === 'undefined') {
      return;
    }

    setIsLoading(true);

    try {
      await (window as any).keplr?.experimentalSuggestChain(getChainInfo());
    } catch (ex) {
      setError(ex.message);
    }

    setIsLoading(false);
  };

  const disconnect = async () => {
    debug('disconnect()');

    if (signingClient) {
      signingClient.disconnect();
    }

    const keys = await AsyncStorage.getAllKeys();
    const accountKeys = keys.filter(key =>
      new RegExp(`^${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}`).test(key)
    );

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    accountKeys.forEach(async key => {
      await AsyncStorage.removeItem(key);
    });

    await AsyncStorage.removeItem(KEY_CONNECTED_WALLET_TYPE);
    await AsyncStorage.removeItem(KEY_WALLET_CONNECT);

    if (connector.connected) {
      void connector.killSession();
    }

    setWalletAddress(null);
    setProfile(null);
    setOfflineSigner(null);
    setSigningClient(null);
    setIsLoading(false);
    setError(null);
  };

  const initKepr = async () => {
    // enable website to access kepler
    await (window as any).keplr.enable(PUBLIC_CHAIN_ID);

    // get offline signer for signing txs
    const myOfflineSigner = await (window as any).getOfflineSigner(PUBLIC_CHAIN_ID);

    // make client
    const client = await SigningCosmWasmClient.connectWithSigner(
      PUBLIC_RPC_ENDPOINT,
      myOfflineSigner
    );

    setSigningClient(client);

    // get user address
    const [{ address }] = await myOfflineSigner.getAccounts();

    if (!address) return false;

    setWalletAddress(address);
    setOfflineSigner(offlineSigner);

    await AsyncStorage.setItem(KEY_CONNECTED_WALLET_TYPE, 'keplr');

    return true;
  };

  const initWalletConnect = async () => {
    let account: any;

    connector.on('disconnect', () => {
      debug('initWalletConnect() -> connector.on("disconnect")');

      void disconnect();
    });

    if (!connector.connected) {
      debug('initWalletConnect() -> not connected');

      await connector.connect();

      [account] = await connector.sendCustomRequest({
        id: payloadId(),
        jsonrpc: '2.0',
        method: 'cosmos_getAccounts',
        params: [PUBLIC_CHAIN_ID],
      });

      debug('initWalletConnect() -> account: %O', account);

      await AsyncStorage.setItem(
        `${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}_${connector.peerId}`,
        JSON.stringify(account)
      );
    } else {
      const serializedWalletConnectAccount = await AsyncStorage.getItem(
        `${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}_${connector.peerId}`
      );
      const walletConnectConnectSession = await AsyncStorage.getItem(KEY_WALLET_CONNECT);

      if (serializedWalletConnectAccount) {
        debug('initWalletConnect() -> load serialized account');

        account = JSON.parse(serializedWalletConnectAccount);
      } else if (walletConnectConnectSession) {
        // remove orphan session
        await AsyncStorage.removeItem(KEY_WALLET_CONNECT);
      }
    }

    if (!account) return false;

    const { bech32Address: address, algo, pubKey: pubKeyInHex } = account;

    if (!address || !algo || !pubKeyInHex) return false;

    const pubkey = new Uint8Array(Buffer.from(pubKeyInHex, 'hex'));
    const accounts: readonly AccountData[] = [{ address, pubkey, algo }];
    const myOfflineSigner: OfflineSigner = {
      getAccounts: () => Promise.resolve(accounts),
      signDirect: async (signerAddress, signDoc) => {
        const signDocInJSON = SignDoc.toJSON(signDoc);
        const resInJSON = await connector.sendCustomRequest({
          id: payloadId(),
          jsonrpc: '2.0',
          method: 'cosmos_signDirect',
          params: [signerAddress, signDocInJSON],
        });

        return {
          signed: SignDoc.fromJSON(resInJSON.signed),
          signature: resInJSON.signature,
        };
      },
    };

    setWalletAddress(address);
    setOfflineSigner(myOfflineSigner);

    await AsyncStorage.setItem(KEY_CONNECTED_WALLET_TYPE, 'likerland_app');

    return true;
  };

  const setupAccount = async () => {
    if (typeof (window as any).keplr === 'undefined') {
      return;
    }

    let connected = false;

    const connectedWalletType = (await AsyncStorage.getItem(
      KEY_CONNECTED_WALLET_TYPE
    )) as ConnectedWalletType;

    debug('connected() -> connectedWalletType: %s', connectedWalletType);

    setIsLoading(true);

    try {
      if (connectedWalletType === 'likerland_app') {
        connected = await initWalletConnect();
      } else if (connectedWalletType === 'keplr') {
        connected = await initKepr();
      }
    } catch (ex) {
      setError(ex.message);
    }

    if (!connected) {
      debug('connected(): no available connection');
    }

    setIsLoading(false);
  };

  const connectWalletConnect = async () => {
    debug('connectWalletConnect()');

    if (connector.connected) {
      return;
    }

    setIsLoading(true);

    try {
      await initWalletConnect();
    } catch (ex) {
      setError(ex.message);
    }

    setIsLoading(false);
  };

  const connectKeplr = async () => {
    debug('connectKeplr()');

    if (typeof (window as any).keplr === 'undefined') {
      setError('Keplr is not available');

      return;
    }

    setIsLoading(true);

    try {
      // suggest likechain
      await suggestChain();

      await initKepr();
    } catch (ex) {
      setError(ex.message);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void setupAccount();

    const keystoreChangeHandler = () => {
      void AsyncStorage.getItem(KEY_CONNECTED_WALLET_TYPE).then(
        (connectedWalletType: ConnectedWalletType) => {
          // eslint-disable-next-line promise/always-return
          if (connectedWalletType === 'keplr') {
            void initKepr();
          }
        }
      );
    };

    window.addEventListener('keplr_keystorechange', keystoreChangeHandler);

    return () => {
      window.removeEventListener('keplr_keystorechange', keystoreChangeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      if (!walletAddress) {
        return;
      }

      setIsLoading(true);

      try {
        const myProfile = await fetchDesmosProfile(walletAddress);

        setProfile(myProfile);
      } catch (ex) {
        debug('useEffect() -> error: %O', ex);
      }

      setIsLoading(false);
    })();
  }, [walletAddress]);

  return {
    walletAddress,
    signingClient,
    profile,
    isLoading,
    error,
    offlineSigner,
    connectKeplr,
    connectWalletConnect,
    disconnect,
  };
};
