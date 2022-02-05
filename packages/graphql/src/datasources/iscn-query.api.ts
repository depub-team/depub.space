import { DataSource } from 'apollo-datasource';
import { ISCNQueryClient, ISCNRecord } from '@likecoin/iscn-js';
import KVCache from '../kv-cache';

const KEY_ISCN_QUERY_API = 'KEY_ISCN_QUERY_API';

export class ISCNQueryAPI extends DataSource {
  private queryClient!: ISCNQueryClient;

  private cache = new KVCache();

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
    const cachingKey = `${KEY_ISCN_QUERY_API}_queryRecordsByFingerprint(${fingerprint}, ${fromSequence})`;
    const cachedRecords = await this.cache.get(cachingKey);

    if (cachedRecords) {
      return JSON.parse(cachedRecords) as ISCNRecord[];
    }

    const res = await this.queryClient.queryRecordsByFingerprint(fingerprint, fromSequence);
    let records: ISCNRecord[] = [];

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

    await this.cache.set(cachingKey, JSON.stringify(records));

    return records;
  }

  public queryRecordsById(iscnId: string, fromVersion?: number, toVersion?: number) {
    return this.queryClient.queryRecordsById(iscnId, fromVersion, toVersion);
  }

  public async queryRecordsByOwner(owner: string, fromSequence?: number): Promise<ISCNRecord[]> {
    const cachingKey = `${KEY_ISCN_QUERY_API}_queryRecordsByOwner(${owner}, ${fromSequence})`;
    const cachedRecords = await this.cache.get(cachingKey);

    if (cachedRecords) {
      return JSON.parse(cachedRecords) as ISCNRecord[];
    }

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

    await this.cache.set(cachingKey, JSON.stringify(records));

    return records;
  }
}
