import { DataSource } from 'apollo-datasource';
import { ISCNQueryClient, ISCNRecord } from '@likecoin/iscn-js';

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
}
