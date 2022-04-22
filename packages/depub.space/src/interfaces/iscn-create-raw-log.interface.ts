export interface ISCNCreateRawLog {
  events: ISCNCreateRawLogEvent[];
}

export interface ISCNCreateRawLogEvent {
  type: string;
  attributes: ISCNCreateRawLogEventAttribute[];
}

export interface ISCNCreateRawLogEventAttribute {
  key: string;
  value: string;
}
