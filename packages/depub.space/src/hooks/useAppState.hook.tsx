import React, {
  createContext,
  FC,
  Reducer,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import * as Sentry from '@sentry/nextjs';
import * as Crypto from 'expo-crypto';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { BroadcastTxSuccess } from '@cosmjs/stargate';
import Debug from 'debug';
import axios from 'axios';
import { Message, User } from '../interfaces';
import { submitToArweaveAndISCN } from '../utils';
import {
  GRAPHQL_QUERY_GET_USER,
  GRAPHQL_QUERY_MESSAGES,
  GRAPHQL_QUERY_GET_MESSAGE,
  GRAPHQL_QUERY_MESSAGES_BY_TAG,
  GRAPHQL_QUERY_MESSAGES_BY_USER,
  ROWS_PER_PAGE,
} from '../contants';
import { signISCN } from '../utils/iscn';

const debug = Debug('web:useAppState');
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export class AppStateError extends Error {}

export interface MessagesQueryResponse {
  messages: Message[];
}

export interface MessagesByTagQueryResponse {
  messagesByHashTag: Message[];
}

export interface MessagesByOwnerResponse {
  getUser: User & {
    messages: Message[];
  };
}

export interface GetUserResopnse {
  getUser: User;
}

export interface AppStateContextProps {
  isLoading: boolean;
  error: string | null;
  fetchUser: (dtagOrAddress: string) => Promise<User | null>;
  fetchMessage: (iscnId: string) => Promise<Message | null>;
  fetchMessages: (previousId?: string) => Promise<Message[] | null>;
  fetchMessagesByTag: (tag: string, previousId?: string) => Promise<Message[] | null>;
  fetchMessagesByOwner: (
    owner: string,
    previousId?: string
  ) => Promise<
    | (User & {
        messages: Message[];
      })
    | null
  >;
  postMessage: (
    offlineSigner: OfflineSigner,
    message: string,
    files?: string | File[]
  ) => Promise<BroadcastTxSuccess | TxRaw | null>;
}

const initialState: AppStateContextProps = {
  error: null,
  isLoading: false,
  fetchUser: null as never,
  fetchMessages: null as never,
  fetchMessage: null as never,
  fetchMessagesByTag: null as never,
  fetchMessagesByOwner: null as never,
  postMessage: null as never,
};

const ISCN_FINGERPRINT = process.env.NEXT_PUBLIC_ISCN_FINGERPRINT || '';

export const AppStateContext = createContext<AppStateContextProps>(initialState);

const enum ActionType {
  SET_IS_LOADING = 'SET_IS_LOADING',
  SET_ERROR = 'SET_ERROR',
}

type Action =
  | { type: ActionType.SET_IS_LOADING; isLoading: boolean }
  | { type: ActionType.SET_ERROR; error: string | null };

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
    default:
      throw new AppStateError('Cannot match action type');
  }
};

export const useAppState = () => useContext(AppStateContext);

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchUser = useCallback(async (dtagOrAddress: string): Promise<User | null> => {
    debug('fetchUser(dtagOrAddress: %s)', dtagOrAddress);

    dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

    try {
      const { data } = await axios.post<{ data: GetUserResopnse }>(
        GRAPHQL_URL,
        {
          variables: {
            dtagOrAddress,
          },
          query: GRAPHQL_QUERY_GET_USER,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

      if (data && data.data.getUser) {
        return data.data.getUser;
      }
    } catch (ex) {
      debug('fetchMessagesByOwner() -> error: %O', ex);

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
    ): Promise<
      | (User & {
          messages: Message[];
        })
      | null
    > => {
      debug('fetchMessagesByOwner(owner: %s, previousId: %s)', owner, previousId);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const { data } = await axios.post<{ data: MessagesByOwnerResponse }>(
          GRAPHQL_URL,
          {
            variables: {
              dtagOrAddress: owner,
              previousId,
              limit: ROWS_PER_PAGE,
            },
            query: GRAPHQL_QUERY_MESSAGES_BY_USER,
          },
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }
        );

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        if (data && data.data.getUser) {
          return data.data.getUser;
        }
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

  const fetchMessages = useCallback(async (previousId?: string): Promise<Message[] | null> => {
    debug('fetchMessages(previousId: %s)', previousId);

    dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

    try {
      const { data } = await axios.post<{ data: MessagesQueryResponse }>(
        GRAPHQL_URL,
        {
          variables: {
            previousId: previousId || null, // graphql not accepts undefined
            limit: ROWS_PER_PAGE,
          },
          query: GRAPHQL_QUERY_MESSAGES,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

      if (data && data.data.messages) {
        return data.data.messages;
      }
    } catch (ex) {
      debug('fetchMessages() -> error: %O', ex);

      dispatch({
        type: ActionType.SET_ERROR,
        error: 'Fail to fetch messages, please try again later.',
      });

      Sentry.captureException(ex);
    }

    return null;
  }, []);

  const fetchMessage = useCallback(async (iscnId?: string): Promise<Message | null> => {
    debug('fetchMessage(iscnId: %s)', iscnId);

    dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

    try {
      const { data } = await axios.post<{ data: { getMessage: Message } }>(
        GRAPHQL_URL,
        {
          variables: {
            iscnId,
          },
          query: GRAPHQL_QUERY_GET_MESSAGE,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

      if (data && data.data.getMessage) {
        return data.data.getMessage;
      }
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

  const fetchMessagesByTag = useCallback(
    async (tag: string, previousId?: string): Promise<Message[] | null> => {
      debug('fetchMessagesByTag(tag: %s, previousId: %s)', tag, previousId);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const { data } = await axios.post<{ data: MessagesByTagQueryResponse }>(
          GRAPHQL_URL,
          {
            variables: {
              tag,
              previousId,
              limit: ROWS_PER_PAGE,
            },
            query: GRAPHQL_QUERY_MESSAGES_BY_TAG,
          },
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }
        );

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        if (data && data.data.messagesByHashTag) {
          return data.data.messagesByHashTag;
        }
      } catch (ex) {
        debug('fetchMessagesByTag() -> error: %O', ex);

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

  const memoValue = useMemo(
    () => ({
      ...state,
      postMessage,
      fetchUser,
      fetchMessages,
      fetchMessage,
      fetchMessagesByTag,
      fetchMessagesByOwner,
    }),
    [
      state,
      fetchUser,
      postMessage,
      fetchMessage,
      fetchMessagesByTag,
      fetchMessages,
      fetchMessagesByOwner,
    ]
  );

  return <AppStateContext.Provider value={memoValue}>{children}</AppStateContext.Provider>;
};
