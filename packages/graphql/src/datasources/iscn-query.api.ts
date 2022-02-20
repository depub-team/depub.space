import { DataSource } from 'apollo-datasource';
import { ISCNQueryClient, ISCNRecord } from '@likecoin/iscn-js';
// eslint-disable-next-line import/no-extraneous-dependencies
import Long from 'long';

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
    let lastSequence = 0;

    const res = await this.queryClient.queryRecordsByFingerprint(fingerprint, fromSequence);
    let nextSequence = res?.nextSequence || Long.ZERO;

    if (res) {
      records = res.records;
      lastSequence = nextSequence.toNumber();

      while (nextSequence.gt(0)) {
        // eslint-disable-next-line no-await-in-loop
        const res2 = await this.queryClient.queryRecordsByFingerprint(
          fingerprint,
          nextSequence.toNumber()
        );

        if (res2) {
          nextSequence = res2.nextSequence;
          records = [...records, ...res2.records];
          if (res2.nextSequence.gt(0)) {
            lastSequence = res2.nextSequence.toNumber();
          }
        }
      }
    }

    return { records, nextSequence: lastSequence };
  }

  public queryRecordsById(iscnId: string, fromVersion?: number, toVersion?: number) {
    return this.queryClient.queryRecordsById(iscnId, fromVersion, toVersion);
  }

  public async queryRecordsByOwner(
    owner: string,
    fromSequence?: number
  ): Promise<{ records: ISCNRecord[]; nextSequence: number }> {
    const res = await this.queryClient.queryRecordsByOwner(owner, fromSequence);
    let records: ISCNRecord[] = [];
    let lastSequence = 0;

    if (res) {
      records = res.records;
      let { nextSequence } = res;

      lastSequence = nextSequence.toNumber();

      while (nextSequence.gt(0)) {
        // eslint-disable-next-line no-await-in-loop
        const res2 = await this.queryClient.queryRecordsByOwner(owner, nextSequence.toNumber());

        if (res2) {
          nextSequence = res2.nextSequence;
          records = [...records, ...res2.records];

          if (res2.nextSequence.gt(0)) {
            lastSequence = res2.nextSequence.toNumber();
          }
        }
      }
    }

    return { records, nextSequence: lastSequence };
  }
}
