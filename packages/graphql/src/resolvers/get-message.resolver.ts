import { Context } from '../context';
import { ISCNRecord } from '../interfaces';
import { getAuthorAddress, transformRecord } from '../utils';
import { getUserProfileResolver } from './get-user-profile.resolver';
import { ISCNError } from '../iscn-error';
import { addTransactions } from './get-messages.resolver';
import { QueryGetMessageArgs } from './generated_types';

const ISCN_TXN_DURABLE_OBJECT = 'http://iscn-txn';

const getTransaction = async (stub: DurableObjectStub, iscnId: string) => {
  const getTransactionRequest = new Request(
    `${ISCN_TXN_DURABLE_OBJECT}/transactions/${encodeURIComponent(iscnId)}`,
    {
      method: 'GET',
    }
  );
  const getTransactionResponse = await stub.fetch(getTransactionRequest);

  if (getTransactionResponse.status === 200) {
    const transaction = await getTransactionResponse.json<ISCNRecord>();

    return transaction || null;
  }

  return null;
};

export const getMessage = async (args: QueryGetMessageArgs, ctx: Context) => {
  try {
    const durableObjId = ctx.env.ISCN_TXN.idFromName('iscn-txn');
    const stub = ctx.env.ISCN_TXN.get(durableObjId);
    let transaction = await getTransaction(stub, args.iscnId);

    // get the iscn record directly on likecoin chain if not found in durable object storage
    if (!transaction) {
      transaction = await ctx.dataSources.iscnQueryAPI.getRecord(args.iscnId);

      // save it into durable object storage
      if (transaction) {
        await addTransactions([transaction], stub);
      }
    }

    if (!transaction) {
      throw new ISCNError('Not found');
    }

    const authorAddress = getAuthorAddress(transaction);

    if (!authorAddress) {
      throw new ISCNError('No author address');
    }

    const userProfile = await getUserProfileResolver({ dtagOrAddress: authorAddress }, ctx);
    const message = transformRecord(authorAddress, transaction, userProfile);

    return message;
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error(ex);

    throw new ISCNError(ex.message);
  }
};
