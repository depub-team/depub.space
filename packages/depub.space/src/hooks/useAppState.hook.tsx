import React, {
  createContext,
  FC,
  Reducer,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import * as Crypto from 'expo-crypto';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { BroadcastTxSuccess } from '@cosmjs/stargate';
import { ISCNQueryClient, ISCNRecord, ISCNSigningClient } from '@likecoin/iscn-js';
import Debug from 'debug';

const debug = Debug('web:useAppState');
const PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '';
const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '';

export class AppStateError extends Error {}

const transformRecord = (records: ISCNRecord[]) => {
  const messages = records.reverse().map(({ data }) => {
    const author = data.stakeholders.find(
      stakeholder => stakeholder.contributionType === 'http://schema.org/author'
    );

    return {
      id: data['@id'] as string,
      message: data.contentMetadata.description,
      from: author.entity['@id'],
      date: new Date(data.contentMetadata.recordTimestamp || data.recordTimestamp),
    };
  });

  return messages;
};

export interface Message {
  id: string;
  message: string;
  from: string;
  date: Date;
}

export interface MessageQueryType {
  messages: Message[];
  nextSequence: number;
}

export interface AppStateContextProps {
  isLoading: boolean;
  error: string | null;
  fetchMessages: () => Promise<MessageQueryType | null>;
  fetchMessagesByOwner: (author: string) => Promise<MessageQueryType | null>;
  postMessage: (message: string) => Promise<BroadcastTxSuccess | TxRaw | null>;
}

const initialState: AppStateContextProps = {
  error: null,
  isLoading: false,
  fetchMessages: null as never,
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

  const fetchMessagesByOwner = useCallback(
    async (
      owner: string
    ): Promise<{
      messages: Message[];
      nextSequence: number;
    } | null> => {
      debug('fetchMessages()');

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const client = new ISCNQueryClient();

        await client.connect(PUBLIC_RPC_ENDPOINT);

        const makeFetchRequest = async (nextSeq: number) => {
          const res = await client.queryRecordsByOwner(owner, nextSeq);

          debug('fetchMessagesByOwner(nextSeq: %d) -> records: %O', nextSeq, res);

          if (res) {
            const messages = transformRecord(res.records);

            return { messages, nextSequence: res.nextSequence };
          }

          return null;
        };

        const firstBatchRes = await makeFetchRequest(0);

        if (!firstBatchRes) {
          return null;
        }

        let batchNextSequence = firstBatchRes.nextSequence;
        let messages = [...firstBatchRes.messages];

        while (!batchNextSequence.isZero()) {
          // eslint-disable-next-line no-await-in-loop
          const anotherBatchRes = await makeFetchRequest(batchNextSequence.toNumber());

          if (anotherBatchRes) {
            batchNextSequence = anotherBatchRes.nextSequence;
            messages = [...anotherBatchRes.messages, ...messages];
          } else {
            break;
          }
        }

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        return { messages, nextSequence: batchNextSequence.toNumber() };
      } catch (ex) {
        debug('fetchMessagesByOwner() -> error: %O', ex);
      }

      dispatch({
        type: ActionType.SET_ERROR,
        error: 'Fail to fetch messages, please try again later.',
      });

      return null;
    },
    []
  );

  const fetchMessages = useCallback(async (): Promise<{
    messages: Message[];
    nextSequence: number;
  } | null> => {
    debug('fetchMessages()');

    dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

    try {
      const client = new ISCNQueryClient();

      await client.connect(PUBLIC_RPC_ENDPOINT);

      const makeFetchRequest = async (nextSeq: number) => {
        const res = await client.queryRecordsByFingerprint(ISCN_FINGERPRINT, nextSeq);

        debug('fetchMessages(nextSeq: %d) -> records: %O', nextSeq, res);

        if (res) {
          const messages = transformRecord(res.records);

          return { messages, nextSequence: res.nextSequence };
        }

        return null;
      };

      const firstBatchRes = await makeFetchRequest(0);

      if (!firstBatchRes) {
        return null;
      }

      let batchNextSequence = firstBatchRes.nextSequence;
      let messages = [...firstBatchRes.messages];

      while (!batchNextSequence.isZero()) {
        // eslint-disable-next-line no-await-in-loop
        const anotherBatchRes = await makeFetchRequest(batchNextSequence.toNumber());

        if (anotherBatchRes) {
          batchNextSequence = anotherBatchRes.nextSequence;
          messages = [...anotherBatchRes.messages, ...messages];
        } else {
          break;
        }
      }

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

      return { messages, nextSequence: batchNextSequence.toNumber() };
    } catch (ex) {
      debug('fetchMessages() -> error: %O', ex);
    }

    dispatch({
      type: ActionType.SET_ERROR,
      error: 'Fail to fetch messages, please try again later.',
    });

    return null;
  }, []);

  const postMessage = useCallback(
    async (message: string) => {
      debug('postMessage() -> message: %s', message);

      dispatch({ type: ActionType.SET_IS_LOADING, isLoading: true });

      try {
        const signer = (window as any).getOfflineSigner(PUBLIC_CHAIN_ID);

        if (!signer) {
          throw new AppStateError('No valid signer, please connect wallet');
        }

        const [wallet] = await signer.getAccounts();
        const signingClient = new ISCNSigningClient();

        await signingClient.connectWithSigner(PUBLIC_RPC_ENDPOINT, signer);

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
              rewardProportion: 0.9,
            },
            {
              entity: {
                '@id': 'https://github.com/0xnan-dev',
                name: '0xNaN',
              },
              contributionType: 'http://schema.org/publisher',
              rewardProportion: 0.1,
            },
          ],
          name: `depub.space-${recordTimestamp}`,
          recordNotes: 'A Message posted on depub.space',
          type: 'Article',
          author: wallet.address,
          description: message,
          version: 1,
          usageInfo: 'https://creativecommons.org/licenses/by/4.0',
        };

        debug('postMessage() -> payload: %O', payload);

        const txn = await signingClient.createISCNRecord(wallet.address, payload);

        dispatch({ type: ActionType.SET_IS_LOADING, isLoading: false });

        return txn;
      } catch (ex) {
        debug('postMesage() -> error: %O', ex);
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
      fetchMessages,
      fetchMessagesByOwner,
    }),
    [state, postMessage, fetchMessages, fetchMessagesByOwner]
  );

  return <AppStateContext.Provider value={memoValue}>{children}</AppStateContext.Provider>;
};
