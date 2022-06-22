import React, {
  useMemo,
  createContext,
  FC,
  Reducer,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from 'react';
import update from 'immutability-helper';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import Debug from 'debug';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { payloadId } from '@walletconnect/utils';
import { AccountData, OfflineSigner } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { ConnectWalletModal } from '../components/organisms/ConnectWalletModal';
import { CosmoStationDirectSigner } from '../utils';

const debug = Debug('web:useSigningCosmWasmClient');
const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '';
const KEY_WALLET_CONNECT_ACCOUNT_PREFIX = 'KEY_WALLET_CONNECT_ACCOUNT_PREFIX';
const KEY_WALLET_CONNECT = 'walletconnect';
const KEY_CONNECTED_WALLET_TYPE = 'KEY_CONNECTED_WALLET_TYPE';
const isTestnet = /testnet/.test(PUBLIC_CHAIN_ID);

type ConnectedWalletType = 'keplr' | 'likerland_app';

export class WalletStateError extends Error {}
export interface WalletContextProps {
  walletAddress: string | undefined;
  offlineSigner: OfflineSigner | undefined;
  connector: WalletConnect | undefined;
  isLoading: boolean;
  error: string | undefined;
  isWalletModalOpen: boolean;
  showWalletModal: () => void;
  closeWalletModal: () => void;
  connectKeplr: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const enum ActionType {
  SET_WALLET_ADDRESS = 'SET_WALLET_ADDRESS',
  SET_CONNECTOR = 'SET_CONNECTOR',
  SET_OFFLINE_SIGNER = 'SET_OFFLINE_SIGNER',
  SET_IS_LOADING = 'SET_IS_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_IS_WALLET_MODAL_OPEN = 'SET_IS_WALLET_MODAL_OPEN',
}

type Action =
  | { type: ActionType.SET_WALLET_ADDRESS; walletAddress: string | undefined }
  | { type: ActionType.SET_OFFLINE_SIGNER; offlineSigner: OfflineSigner | undefined }
  | { type: ActionType.SET_CONNECTOR; connector: WalletConnect | undefined }
  | { type: ActionType.SET_IS_LOADING; isLoading: boolean }
  | { type: ActionType.SET_ERROR; error: string | undefined }
  | { type: ActionType.SET_IS_WALLET_MODAL_OPEN; isWalletModalOpen: boolean };

const reducer: Reducer<WalletContextProps, Action> = (state, action) => {
  debug('reducer: %O', action);

  switch (action.type) {
    case ActionType.SET_CONNECTOR:
      return update(state, {
        connector: { $set: action.connector },
      });
    case ActionType.SET_WALLET_ADDRESS:
      return update(state, {
        walletAddress: { $set: action.walletAddress },
      });
    case ActionType.SET_OFFLINE_SIGNER:
      return update(state, {
        offlineSigner: { $set: action.offlineSigner },
      });
    case ActionType.SET_IS_LOADING:
      return update(state, {
        isLoading: { $set: action.isLoading },
      });
    case ActionType.SET_ERROR:
      return update(state, {
        isLoading: { $set: false },
        error: { $set: action.error },
      });
    case ActionType.SET_IS_WALLET_MODAL_OPEN:
      return update(state, {
        isWalletModalOpen: { $set: action.isWalletModalOpen },
      });
    default:
      throw new WalletStateError(`Cannot match action type ${(action as any).type}`);
  }
};

export const getChainInfo = () => {
  const mainnet = {
    chainId: 'likecoin-mainnet-2',
    chainName: 'LikeCoin',
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
      bech32PrefixAccAddr: 'like',
      bech32PrefixAccPub: 'likepub',
      bech32PrefixValAddr: 'likevaloper',
      bech32PrefixValPub: 'likevaloperpub',
      bech32PrefixConsAddr: 'likevalcons',
      bech32PrefixConsPub: 'likevalconspub',
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
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
  };

  const testnet = {
    chainId: 'likecoin-public-testnet-5',
    chainName: 'LikeCoin public test chain',
    rpc: 'https://likecoin-public-testnet-5.oursky.dev/rpc/',
    rest: 'https://likecoin-public-testnet-5.oursky.dev/',
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
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
  };

  return isTestnet ? testnet : mainnet;
};

const initialState = {
  walletAddress: undefined,
  offlineSigner: undefined,
  isLoading: false,
  isWalletModalOpen: false,
  connector: undefined,
  error: undefined,
  showWalletModal: undefined as never,
  closeWalletModal: undefined as never,
  connectKeplr: undefined as never,
  connectWalletConnect: undefined as never,
  disconnect: undefined as never,
};

export const WalletContext = createContext<WalletContextProps>(initialState);

export const useWallet = () => {
  const ctx = useContext(WalletContext);

  return ctx;
};

export const useWalletActions = (state: WalletContextProps, dispatch: React.Dispatch<Action>) => {
  const setIsLoading = (isLoading: boolean) =>
    dispatch({ type: ActionType.SET_IS_LOADING, isLoading });

  const setError = (error: string | undefined) => dispatch({ type: ActionType.SET_ERROR, error });

  const setWalletAddress = (walletAddress: string | undefined) =>
    dispatch({ type: ActionType.SET_WALLET_ADDRESS, walletAddress });

  const setOfflineSigner = (offlineSigner: OfflineSigner | undefined) =>
    dispatch({ type: ActionType.SET_OFFLINE_SIGNER, offlineSigner });

  const setIsWalletModalOpen = (isWalletModalOpen: boolean) =>
    dispatch({ type: ActionType.SET_IS_WALLET_MODAL_OPEN, isWalletModalOpen });

  const setConnector = (connector: WalletConnect | undefined) =>
    dispatch({ type: ActionType.SET_CONNECTOR, connector });

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

  const initKeplr = async () => {
    // enable website to access kepler
    await (window as any).keplr.enable(PUBLIC_CHAIN_ID);

    // get offline signer for signing txs
    // const myOfflineSigner = await (window as any).getOfflineSigner(PUBLIC_CHAIN_ID);
    const myOfflineSigner = await (window as any).getOfflineSignerAuto(PUBLIC_CHAIN_ID);

    // get user address
    const [account] = await myOfflineSigner.getAccounts();

    if (!account.address) return false;

    setWalletAddress(account.address);
    setOfflineSigner(myOfflineSigner);

    await AsyncStorage.setItem(KEY_CONNECTED_WALLET_TYPE, 'keplr');

    setIsWalletModalOpen(false); // close modal

    return true;
  };

  const disconnect = async () => {
    debug('disconnect()');

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

    if (state.connector?.connected) {
      void state.connector.killSession();
      setConnector(undefined);
    }

    setWalletAddress(undefined);
    setOfflineSigner(undefined);
    setIsLoading(false);
    setError(undefined);
  };

  const initCosmostation = async () => {
    const w = window as any;

    if (!w.cosmostation) {
      setError(
        'Please install cosmostation wallet, if you just installed it, please refresh the page.'
      );

      return false;
    }

    const chainInfo = getChainInfo();
    const { chainName } = chainInfo;
    const supportedChains = await w.cosmostation.tendermint.request({
      method: 'ten_supportedChainNames',
    });

    if (
      !supportedChains.official.includes(chainName) &&
      !supportedChains.unofficial.includes(chainName)
    ) {
      await w.cosmostation.tendermint.request({
        method: 'ten_addChain',
        params: {
          chainId: chainInfo.chainId,
          chainName,
          addressPrefix: chainInfo.bech32Config.bech32PrefixAccAddr,
          baseDenom: chainInfo.stakeCurrency.coinMinimalDenom,
          displayDenom: chainInfo.currencies[0].coinDenom,
          restURL: chainInfo.rest,
          coinType: '118', // optional (default: '118')
          decimals: chainInfo.currencies[0].coinDecimals,
          gasRate: {
            // optional (default: { average: '0.025', low: '0.0025', tiny: '0.00025' })
            average: '1000',
            low: '10',
            tiny: '1',
          },
          sendGas: '350000', // reference https://github.com/likecoin/lunie-ng/blob/c31d604201c6dd56fbe618e3ac3451993726f2b1/network.js
        },
      });
    }

    // Enable
    await w.cosmostation.tendermint.request({
      method: 'ten_requestAccount',
      params: { chainName },
    });

    const myOfflineSigner = new CosmoStationDirectSigner(chainName);
    const [account] = await myOfflineSigner.getAccounts();

    if (!account.address) return false;

    setWalletAddress(account.address);
    setOfflineSigner(myOfflineSigner);

    await AsyncStorage.setItem(KEY_CONNECTED_WALLET_TYPE, 'cosmostation');

    setIsWalletModalOpen(false); // close modal

    return true;
  };

  const initWalletConnect = async () => {
    let account: any;
    let newConnector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
      qrcodeModalOptions: {
        desktopLinks: [],
        mobileLinks: [],
      },
    });

    setConnector(newConnector);

    if (newConnector?.connected) {
      await newConnector.killSession();

      newConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: QRCodeModal,
        qrcodeModalOptions: {
          desktopLinks: [],
          mobileLinks: [],
        },
      });
    }

    newConnector.on('disconnect', () => {
      debug('initWalletConnect() -> connector.on("disconnect")');

      void disconnect();
    });

    if (!newConnector.connected) {
      debug('initWalletConnect() -> not connected');

      await newConnector.connect();

      [account] = await newConnector.sendCustomRequest({
        id: payloadId(),
        jsonrpc: '2.0',
        method: 'cosmos_getAccounts',
        params: [PUBLIC_CHAIN_ID],
      });

      debug('initWalletConnect() -> account: %O', account);

      await AsyncStorage.setItem(
        `${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}_${newConnector.peerId}`,
        JSON.stringify(account)
      );
    } else {
      const serializedWalletConnectAccount = await AsyncStorage.getItem(
        `${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}_${newConnector.peerId}`
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

    setIsWalletModalOpen(false); // close modal

    if (!address || !algo || !pubKeyInHex) return false;

    const pubkey = new Uint8Array(Buffer.from(pubKeyInHex, 'hex'));
    const accounts: readonly AccountData[] = [{ address, pubkey, algo }];
    const myOfflineSigner: OfflineSigner = {
      getAccounts: () => Promise.resolve(accounts),
      signDirect: async (signerAddress, signDoc) => {
        const signDocInJSON = SignDoc.toJSON(signDoc);
        const resInJSON = await newConnector.sendCustomRequest({
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
        connected = await initKeplr();
      } else if (connectedWalletType === 'cosmostation') {
        connected = await initCosmostation();
      }
    } catch (ex) {
      setError(ex.message);
    }

    if (!connected) {
      debug('connected(): no available connection');
    }

    setIsLoading(false);
  };

  return {
    setupAccount,
    initKeplr,
    initWalletConnect,
    initCosmostation,
    connectKeplr: async () => {
      debug('connectKeplr()');

      if (typeof (window as any).keplr === 'undefined') {
        setError('Keplr is not available, if you just installed it, please refresh the browser.');

        return;
      }

      setIsLoading(true);

      try {
        // suggest likechain
        await suggestChain();

        const connected = await initKeplr();

        if (!connected) {
          setError('Cannot connect, please try again later.');
        }
      } catch (ex) {
        setError(ex.message);
      }

      setIsLoading(false);
      setIsWalletModalOpen(false);
    },
    connectWalletConnect: async () => {
      debug('connectWalletConnect()');

      setIsLoading(true);

      try {
        const connected = await initWalletConnect();

        if (!connected) {
          setError('Cannot connect, please try again later.');
        }
      } catch (ex) {
        setError(ex.message);
      }

      setIsLoading(false);
      setIsWalletModalOpen(false);
    },
    connectCosmostation: async () => {
      debug('connectCosmostation()');

      setIsLoading(true);

      try {
        const connected = await initCosmostation();

        if (!connected) {
          setError('Cannot connect, please try again later.');
        }
      } catch (ex) {
        setError(ex.message);
      }

      setIsLoading(false);
      setIsWalletModalOpen(false);
    },
    disconnect,
    showWalletModal: () => {
      setIsWalletModalOpen(true);
    },
    closeWalletModal: () => {
      setIsWalletModalOpen(false);
    },
  };
};

export interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = useWalletActions(state, dispatch);

  useEffect(() => {
    void actions.setupAccount();

    const keystoreChangeHandler = () => {
      void AsyncStorage.getItem(KEY_CONNECTED_WALLET_TYPE).then(
        (connectedWalletType: ConnectedWalletType) => {
          // eslint-disable-next-line promise/always-return
          if (connectedWalletType === 'keplr') {
            void actions.initKeplr();
          }
        }
      );
    };

    const handleCosmostationAccountChanged = () => {
      void actions.initCosmostation();
    };

    const cosmostationAccountChangedEvent =
      (window as any).cosmostation &&
      (window as any).cosmostation.tendermint.on(
        'accountChanged',
        handleCosmostationAccountChanged
      );

    window.addEventListener('keplr_keystorechange', keystoreChangeHandler);

    return () => {
      window.removeEventListener('keplr_keystorechange', keystoreChangeHandler);

      if (cosmostationAccountChangedEvent) {
        (window as any).cosmostation.tendermint.off(cosmostationAccountChangedEvent);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  return (
    <WalletContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={contextValue}
    >
      {children}
      <ConnectWalletModal
        isOpen={state.isWalletModalOpen}
        onClose={actions.closeWalletModal}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onPressCosmostation={actions.connectCosmostation}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onPressKeplr={actions.connectKeplr}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onPressWalletConnect={actions.connectWalletConnect}
      />
    </WalletContext.Provider>
  );
};
