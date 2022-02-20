import { DataSource } from 'apollo-datasource';
import { ISCNQueryClient, ISCNRecord } from '@likecoin/iscn-js';
import { LCD } from '../interfaces';

export class ISCNQueryAPI extends DataSource {
  private queryClient!: ISCNQueryClient;

  constructor(protected rpc: string) {
    // eslint-disable-next-line no-console
    console.info(`ISCNQueryAPI(rpc: ${rpc})`);

    super();
  }

  public async initialize() {
    this.queryClient = new ISCNQueryClient();

    await this.queryClient.connect(this.rpc);
  }

  public queryISCNIdsByTx(txId: string) {
    return this.queryClient.queryISCNIdsByTx(txId);
  }

  public queryFeePerByte() {
    return this.queryClient.queryFeePerByte();
  }

  public async queryRecordsByFingerprint(fingerprint: string, fromSequence?: number) {
    let records: ISCNRecord[] = [];

    console.log(env);

    const res = await this.queryClient.queryRecordsByFingerprint(fingerprint, fromSequence);

    if (res) {
      records = res.records;
      let { nextSequence } = res;

      while (nextSequence.gt(0)) {
        // eslint-disable-next-line no-await-in-loop
        const res2 = await this.queryClient.queryRecordsByFingerprint(
          fingerprint,
          nextSequence.toNumber()
        );

        if (res2) {
          nextSequence = res2.nextSequence;
          records = [...records, ...res2.records];
        }
      }
    }

    return records;
  }

  public queryRecordsById(iscnId: string, fromVersion?: number, toVersion?: number) {
    return this.queryClient.queryRecordsById(iscnId, fromVersion, toVersion);
  }

  public async queryRecordsByOwner(owner: string, fromSequence?: number): Promise<ISCNRecord[]> {
    const res = await this.queryClient.queryRecordsByOwner(owner, fromSequence);
    let records: ISCNRecord[] = [];

    if (res) {
      records = res.records;
      let { nextSequence } = res;

      while (nextSequence.gt(0)) {
        // eslint-disable-next-line no-await-in-loop
        const res2 = await this.queryClient.queryRecordsByOwner(owner, nextSequence.toNumber());

        if (res2) {
          nextSequence = res2.nextSequence;
          records = [...records, ...res2.records];
        }
      }
    }

    return records;
  }

  // XXX: unused, waiting for more comprehensive query
  public async queryLCDTransaction(
    limit = 12,
    offset = 0
  ): Promise<{ records: ISCNRecord[]; limit: number; offset: number; hasNext: boolean }> {
    const res = await fetch(
      `${NODE_URL}/cosmos/tx/v1beta1/txs?order_by=ORDER_BY_DESC&events=message.module=%27iscn%27&pagination.limit=${limit}&pagination.offset=${offset}`
    );
    const json: LCD.TransactionResponse = await res.json();
    const records = json.tx_responses.map(tx => ({
      ipld:
        tx.logs[0].events
          .find(evt => evt.type === 'iscn_record')
          ?.attributes.find(attr => attr.key === 'ipld')?.value || 'no-ipld',
      data: tx.tx.body.messages[0].record as any,
    }));

    return {
      records,
      limit,
      offset,
      hasNext: records.length >= limit,
    };
  }
}
