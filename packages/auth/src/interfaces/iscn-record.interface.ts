export interface ISCNRecordData {
  '@id': string;
  '@type': string; // Record
  stakeholders: any[];
  contentMetadata: any;
  recordNotes: string;
  contentFingerprints: string[];
  recordTimestamp: string;
  owner: string;
}

export interface ISCNRecord {
  ipld: string;
  data: ISCNRecordData & { [key: string]: unknown };
}
