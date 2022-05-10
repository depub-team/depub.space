import { Context } from '../context';
import type { GetTransactionsOptions, GetMessagesArgs, ISCNRecord } from '../interfaces';
import { getAuthorAddress, transformRecord } from '../utils';
import { getUserProfile } from './get-user-profile.resolver';
import { getLatestSequence } from './get-latest-sequence';
import { ISCNError } from '../iscn-error';

const PAGING_LIMIT = 12;
const ISCN_TXN_DURABLE_OBJECT = 'http://iscn-txn';

const getTransactions = async (
  stub: DurableObjectStub,
  { limit = PAGING_LIMIT, previousId, hashtag, mentioned, author }: GetTransactionsOptions
) => {
  const urlSearchParams = new URLSearchParams(`limit=${limit}&from=${previousId}`);

  if (hashtag) {
    urlSearchParams.append('hashtag', hashtag);
  }

  if (mentioned) {
    urlSearchParams.append('mentioned', mentioned);
  }

  if (author) {
    urlSearchParams.append('author', author);
  }

  const getTransactionsRequest = new Request(
    `${ISCN_TXN_DURABLE_OBJECT}/transactions?${urlSearchParams.toString()}`,
    {
      method: 'GET',
    }
  );
  const getTransactionsResponse = await stub.fetch(getTransactionsRequest);
  const { transactions } = await getTransactionsResponse.json<{ transactions: ISCNRecord[] }>();

  return transactions || [];
};

const updateLatestSequence = async (nextSequence: number, stub: DurableObjectStub) => {
  const updateSequenceRequest = new Request(`${ISCN_TXN_DURABLE_OBJECT}/sequence`, {
    method: 'PUT',
    body: JSON.stringify({
      nextSequence,
    }),
  });
  const updateSequenceResponse = await stub.fetch(updateSequenceRequest);

  if (updateSequenceResponse.status !== 201) {
    throw new ISCNError('Failed to update next sequence');
  }
};

export const addTransactions = async (records: ISCNRecord[], stub: DurableObjectStub) => {
  const addTransactionRequest = new Request(`${ISCN_TXN_DURABLE_OBJECT}/transactions`, {
    method: 'PUT',
    body: JSON.stringify(records),
  });
  const addTransactionResponse = await stub.fetch(addTransactionRequest);

  if (addTransactionResponse.status !== 201) {
    throw new ISCNError('Failed to add transactions');
  }
};

export const getMessages = async (args: GetMessagesArgs, ctx: Context) => {
  try {
    // initial durable object
    const durableObjId = ctx.env.ISCN_TXN.idFromName('iscn-txn');
    const stub = ctx.env.ISCN_TXN.get(durableObjId);
    const limit = args.limit ? args.limit : PAGING_LIMIT;
    const hashtag = args.tag ? args.tag : undefined;
    const author = args.author ? args.author : undefined;
    const mentioned = args.mentioned ? args.mentioned : undefined;
    const previousId = args.previousId || undefined;

    // only getting new transactions from RPC when not in paginated
    if (!previousId) {
      // get latest sequence
      const latestSequence = await getLatestSequence(stub);

      // check new records
      const { records, nextSequence } = await ctx.dataSources.iscnQueryAPI.getRecords(
        ctx.env.ISCN_FINGERPRINT,
        latestSequence
      );

      if (nextSequence > latestSequence) {
        await updateLatestSequence(nextSequence, stub);
      }

      // add new transactions
      if (records.length) {
        await addTransactions(records, stub);
      }
    }

    const transactions = await getTransactions(stub, {
      limit,
      previousId,
      hashtag,
      mentioned,
      author,
    });

    const messages = await Promise.all(
      transactions.map(async t => {
        const authorAddress = getAuthorAddress(t);
        const userProfile = await getUserProfile({ address: authorAddress }, ctx);
        const message = transformRecord(t, userProfile);

        return message;
      })
    );

    return messages;
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error(ex);

    throw new ISCNError(ex.message);
  }
};
