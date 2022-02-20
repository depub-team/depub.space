export interface ISCNRecordData {
  stakeholders: any[];
  contentMetadata: any;
  recordNotes: string;
  contentFingerprints: string[];
}

export interface ISCNRecord {
  ipld: string;
  data: ISCNRecordData & { [key: string]: unknown };
}
