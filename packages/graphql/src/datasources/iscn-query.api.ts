import { DataSource } from 'apollo-datasource';
import { ISCNRecord } from '../interfaces';

export class ISCNQueryAPI extends DataSource {
  constructor(protected nodeUrl: string) {
    // eslint-disable-next-line no-console
    console.info(`ISCNQueryAPI(nodeUrl: ${nodeUrl})`);

    super();
  }

  public async getRecords(
    fingerprint: string,
    fromSequence: number
  ): Promise<{ records: ISCNRecord[]; nextSequence: number }> {
    const res = await fetch(
      `${this.nodeUrl}iscn/records/fingerprint?fingerprint=${encodeURIComponent(
        fingerprint
      )}&fromSequence=${fromSequence}`
    );

    const json = await res.json<{ records: ISCNRecord[]; next_sequence: number }>();

    return {
      records: json.records,
      nextSequence: json.next_sequence,
    };
  }

  public async getRecord(iscnId: string): Promise<ISCNRecord | null> {
    const res = await fetch(`${this.nodeUrl}iscn/records/id?iscn_id=${encodeURIComponent(iscnId)}`);

    const json = await res.json<{ records: ISCNRecord[]; next_sequence: number }>();

    return json.records[0] || null;
  }
}
