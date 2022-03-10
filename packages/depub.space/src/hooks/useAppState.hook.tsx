import React, {
  createContext,
  FC,
  Reducer,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import * as Sentry from '@sentry/nextjs';
import * as Crypto from 'expo-crypto';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { BroadcastTxSuccess } from '@cosmjs/stargate';
import Debug from 'debug';
import { DesmosProfile, Message, User, HashTag, PaginatedResponse, List } from '../interfaces';
import {
  getMessages,
  submitToArweaveAndISCN,
  getMessagesByOwner,
  getUserByDTagOrAddress,
  getMessagesByHashTag,
  getMessageById,
  getChannels,
  GetChannelsResponse,
  GetUserWithMessagesResponse,
} from '../utils';
import { signISCN } from '../utils/iscn';
import { useAlert } from '../components/molecules/Alert';
import { LoadingModal } from '../components/organisms/LoadingModal';
import { useWallet } from './useWallet.hook';

const debug = Debug('web:useAppState');

export class AppStateError extends Error {}

export interface AppStateContextProps {
  isLoading: boolean;
  error: string | null;
  profile: DesmosProfile | null;
  channels: List[];
  hashTags: HashTag[];
  showLoading: () => void;
  closeLoading: () => void;
  fetchUser: (dtagOrAddress: string) => Promise<User | null>;
  fetchChannels: () => Promise<GetChannelsResponse>;
  fetchMessage: (iscnId: string) => Promise<Message | null>;
  fetchMessages: (previousId?: string) => Promise<PaginatedResponse<Message[]>>;
  fetchMessagesByHashTag: (
    tag: string,
    previousId?: string,
    limit?: number
  ) => Promise<PaginatedResponse<Message[]>>;
  fetchMessagesByOwner: (
    owner: string,
    previousId?: string
  ) => Promise<PaginatedResponse<GetUserWithMessagesResponse | null> | null>;
  postMessage: (
    offlineSigner: OfflineSigner,
    message: string,
    files?: string | File[]
  ) => Promise<BroadcastTxSuccess | TxRaw | null>;
}

const initialState: AppStateContextProps = {
  channels: [],
  hashTags: [],
  error: null,
  isLoading: false,
  profile: null,
  fetchUser: null as never,
  showLoading: null as never,
  closeLoading: null as never,
  fetchChannels: null as never,
  fetchMessages: null as never,
  fetchMessage: null as never,
  fetchMessagesByHashTag: null as never,
  fetchMessagesByOwner: null as never,
  postMessage: null as never,
};

const ISCN_FINGERPRINT = process.env.NEXT_PUBLIC_ISCN_FINGERPRINT || '';

export const AppStateContext = createContext<AppStateContextProps>(initialState);

const enum ActionType {
  SET_IS_LOADING = 'SET_IS_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_PROFILE = 'SET_PROFILE',
  SET_CHANNELS = 'SET_CHANNELS',
  SET_HASHTAGS = 'SET_HASHTAGS',
}

type Action =
  | { type: ActionType.SET_IS_LOADING; isLoading: boolean }
  | { type: ActionType.SET_ERROR; error: string | null }
  | { type: ActionType.SET_PROFILE; profile: DesmosProfile | null }
  | { type: ActionType.SET_CHANNELS; channels: List[] }
  | { type: ActionType.SET_HASHTAGS; hashTags: HashTag[] };

const reducer: Reducer<AppStateContextProps, Action> = (state, action) => {
  debug('reducer: %O', action);

  switch (action.type) {
    case ActionType.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case ActionType.SET_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    case ActionType.SET_PROFILE:
      return {
        ...state,
        profile: action.profile,
      };
    case ActionType.SET_HASHTAGS:
      return {
        ...state,
        hashTags: action.hashTags,
      };
    case ActionType.SET_CHANNELS:
      return {
        ...state,
        channels: action.channels,
      };
    default:
      throw new AppStateError(`Cannot match action type ${(action as any).type}`);
  }
};

export const useAppState = () => useContext(AppStateContext);

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const alert = useAlert();
  const { walletAddress, error: connectError } = useWallet();

  const fetchUser = useCallback(async (dtagOrAddress: string): Promise<User | null> => {
    debug('fetchUser(dtagOrAddress: %s)', dtagOrAddress);

    dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

    try {
      const user = await getUserByDTagOrAddress(dtagOrAddress);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

      return user;
    } catch (ex) {
      debug('fetchUser() -> error: %O', ex);

      dispatch({
        type: ActionType.SET_ERROR,
        error: 'Fail to fetch messages, please try again later.',
      });

      Sentry.captureException(ex);
    }

    return null;
  }, []);

  const fetchMessagesByOwner = useCallback(
    async (
      owner: string,
      previousId?: string
    ): Promise<PaginatedResponse<GetUserWithMessagesResponse | null> | null> => {
      debug('fetchMessagesByOwner(owner: %s, previousId: %s)', owner, previousId);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const messagesByOwner = await getMessagesByOwner(owner, previousId);

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        return messagesByOwner;
      } catch (ex) {
        debug('fetchMessagesByOwner() -> error: %O', ex);

        dispatch({
          type: ActionType.SET_ERROR,
          error: 'Fail to fetch messages, please try again later.',
        });

        Sentry.captureException(ex);
      }

      return null;
    },
    []
  );

  const fetchChannels = useCallback(async (): Promise<GetChannelsResponse> => {
    debug('fetchChannels()');

    dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

    try {
      const channels = await getChannels();

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });
      dispatch({ type: ActionType.SET_CHANNELS, channels: channels.list });
      dispatch({ type: ActionType.SET_HASHTAGS, hashTags: channels.hashTags });

      return channels;
    } catch (ex) {
      debug('fetchChannels() -> error: %O', ex);

      dispatch({
        type: ActionType.SET_ERROR,
        error: 'Fail to fetch channels, please try again later.',
      });

      Sentry.captureException(ex);
    }

    return { list: [], hashTags: [] };
  }, []);

  const fetchMessages = useCallback(
    async (previousId?: string): Promise<PaginatedResponse<Message[]>> => {
      debug('fetchMessages(previousId: %s)', previousId);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const messages = await getMessages(previousId);

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        return messages;
      } catch (ex) {
        debug('fetchMessages() -> error: %O', ex);

        dispatch({
          type: ActionType.SET_ERROR,
          error: 'Fail to fetch messages, please try again later.',
        });

        Sentry.captureException(ex);
      }

      return {
        data: [],
        hasMore: false,
      };
    },
    []
  );

  const fetchMessage = useCallback(async (iscnId: string): Promise<Message | null> => {
    debug('fetchMessage(iscnId: %s)', iscnId);

    dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

    try {
      const message = await getMessageById(iscnId);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

      return message;
    } catch (ex) {
      debug('fetchMessage() -> error: %O', ex);

      dispatch({
        type: ActionType.SET_ERROR,
        error: `Fail to fetch message(${iscnId}), please try again later.`,
      });

      Sentry.captureException(ex);
    }

    return null;
  }, []);

  const fetchMessagesByHashTag = useCallback(
    async (
      tag: string,
      previousId?: string,
      limit?: number
    ): Promise<PaginatedResponse<Message[]>> => {
      debug('fetchMessagesByHashTag(tag: %s, previousId: %s)', tag, previousId);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const messages = await getMessagesByHashTag(tag, previousId, limit);

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        return messages;
      } catch (ex) {
        debug('fetchMessagesByHashTag() -> error: %O', ex);

        dispatch({
          type: ActionType.SET_ERROR,
          error: 'Fail to fetch messages, please try again later.',
        });

        Sentry.captureException(ex);
      }

      return {
        data: [],
        hasMore: false,
      };
    },
    []
  );

  const postMessage = useCallback(
    async (offlineSigner: OfflineSigner, message: string, files?: string | File[]) => {
      debug('postMessage() -> message: %s, files: %O', message, files);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const [wallet] = await offlineSigner.getAccounts();
        const recordTimestamp = new Date().toISOString();
        const datePublished = recordTimestamp.split('T')[0];
        const messageSha256Hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          message
        );
        const payload = {
          contentFingerprints: [ISCN_FINGERPRINT, `hash://sha256/${messageSha256Hash}`],
          recordTimestamp,
          datePublished,
          stakeholders: [
            {
              entity: {
                '@id': wallet.address,
                name: wallet.address,
              },
              contributionType: 'http://schema.org/author',
              rewardProportion: 0.975,
            },
            {
              entity: {
                '@id': 'https://depub.SPACE',
                name: 'depub.SPACE',
              },
              contributionType: 'http://schema.org/publisher',
              rewardProportion: 0.025,
            },
          ],
          name: `depub.space-${recordTimestamp}`,
          recordNotes: 'A Message posted on depub.SPACE',
          type: 'Article',
          author: wallet.address,
          description: message,
          version: 1,
          usageInfo: 'https://creativecommons.org/licenses/by/4.0',
        };

        debug('postMessage() -> payload: %O', payload);

        let txn: TxRaw | BroadcastTxSuccess;

        if (files) {
          txn = await submitToArweaveAndISCN(files, payload, offlineSigner, wallet.address);
        } else {
          txn = await signISCN(payload, offlineSigner, wallet.address);
        }

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        return txn;
      } catch (ex) {
        debug('postMessage() -> error: %O', ex);

        if (/^Account does not exist on chain/.test(ex.message)) {
          dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

          throw new AppStateError(ex.message);
        }

        Sentry.captureException(ex);
      }

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

      throw new AppStateError('Failed to post your message, please try it again later.');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchMessages]
  );

  const showLoading = useCallback(() => {
    setIsLoadingModalOpen(true);
  }, []);

  const closeLoading = useCallback(() => {
    setIsLoadingModalOpen(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      if (walletAddress) {
        const user = await fetchUser(walletAddress);

        if (user && user.profile) {
          dispatch({ type: ActionType.SET_PROFILE, profile: user.profile });
        }
      }
    })();
  }, [walletAddress, fetchUser]);

  useEffect(() => {
    if (connectError) {
      debug('useEffect() -> connectError: %s', connectError);

      alert.show({
        title: connectError,
        status: 'error',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

  // get channels
  useEffect(() => {
    void fetchChannels();
  }, [fetchChannels]);

  const memoValue = useMemo(
    () => ({
      ...state,
      postMessage,
      fetchUser,
      fetchMessages,
      fetchMessage,
      fetchChannels,
      fetchMessagesByHashTag,
      fetchMessagesByOwner,
      showLoading,
      closeLoading,
    }),
    [
      state,
      fetchUser,
      postMessage,
      fetchMessage,
      fetchChannels,
      fetchMessagesByHashTag,
      fetchMessages,
      fetchMessagesByOwner,
      showLoading,
      closeLoading,
    ]
  );

  return (
    <AppStateContext.Provider value={memoValue}>
      {children}

      <LoadingModal isOpen={isLoadingModalOpen} />
    </AppStateContext.Provider>
  );
};
