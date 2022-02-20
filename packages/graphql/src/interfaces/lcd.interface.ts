export declare namespace LCD {
  export interface Entity {
    '@id': string;
    name: string;
  }

  export interface Stakeholder {
    entity: Entity;
    contributionType: string;
    rewardProportion: number;
  }

  export interface ExifInfo {
    Size: string;
    Format: string;
  }

  export interface ContentMetadata {
    name: string;
    '@type': string;
    author: string;
    version: number;
    '@context': string;
    keywords: string;
    usageInfo: string;
    description: string;
    datePublished: string;
    recordTimestamp: Date;
    url: string;
    exifInfo: ExifInfo;
  }

  export interface Record {
    recordNotes: string;
    contentFingerprints: string[];
    stakeholders: Stakeholder[];
    contentMetadata: ContentMetadata;
  }

  export interface Message {
    '@type': string;
    from: string;
    record: Record;
  }

  export interface Body {
    messages: Message[];
    memo: string;
    timeout_height: string;
    extension_options: any[];
    non_critical_extension_options: any[];
  }

  export interface PublicKey {
    '@type': string;
    key: string;
  }

  export interface Single {
    mode: string;
  }

  export interface ModeInfo {
    single: Single;
  }

  export interface SignerInfo {
    public_key: PublicKey;
    mode_info: ModeInfo;
    sequence: string;
  }

  export interface Amount {
    denom: string;
    amount: string;
  }

  export interface Fee {
    amount: Amount[];
    gas_limit: string;
    payer: string;
    granter: string;
  }

  export interface AuthInfo {
    signer_infos: SignerInfo[];
    fee: Fee;
  }

  export interface Tx {
    body: Body;
    auth_info: AuthInfo;
    signatures: string[];
  }

  export interface Attribute {
    key: string;
    value: string;
  }

  export interface Event {
    type: string;
    attributes: Attribute[];
  }

  export interface Log {
    msg_index: number;
    log: string;
    events: Event[];
  }

  export interface Entity2 {
    '@id': string;
    name: string;
  }

  export interface Stakeholder2 {
    entity: Entity2;
    contributionType: string;
    rewardProportion: number;
  }

  export interface ExifInfo2 {
    Size: string;
    Format: string;
  }

  export interface ContentMetadata2 {
    name: string;
    '@type': string;
    author: string;
    version: number;
    '@context': string;
    keywords: string;
    usageInfo: string;
    description: string;
    datePublished: string;
    recordTimestamp: Date;
    url: string;
    exifInfo: ExifInfo2;
  }

  export interface Record2 {
    recordNotes: string;
    contentFingerprints: string[];
    stakeholders: Stakeholder2[];
    contentMetadata: ContentMetadata2;
  }

  export interface Message2 {
    '@type': string;
    from: string;
    record: Record2;
  }

  export interface Body2 {
    messages: Message2[];
    memo: string;
    timeout_height: string;
    extension_options: any[];
    non_critical_extension_options: any[];
  }

  export interface PublicKey2 {
    '@type': string;
    key: string;
  }

  export interface Single2 {
    mode: string;
  }

  export interface ModeInfo2 {
    single: Single2;
  }

  export interface SignerInfo2 {
    public_key: PublicKey2;
    mode_info: ModeInfo2;
    sequence: string;
  }

  export interface Amount2 {
    denom: string;
    amount: string;
  }

  export interface Fee2 {
    amount: Amount2[];
    gas_limit: string;
    payer: string;
    granter: string;
  }

  export interface AuthInfo2 {
    signer_infos: SignerInfo2[];
    fee: Fee2;
  }

  export interface Tx2 {
    '[@type]': string;
    body: Body2;
    auth_info: AuthInfo2;
    signatures: string[];
  }

  export interface Attribute2 {
    key: string;
    value: string;
    index: boolean;
  }

  export interface Event2 {
    type: string;
    attributes: Attribute2[];
  }

  export interface TxRespons {
    height: string;
    txhash: string;
    codespace: string;
    code: number;
    data: string;
    raw_log: string;
    logs: Log[];
    info: string;
    gas_wanted: string;
    gas_used: string;
    tx: Tx2;
    timestamp: Date;
    events: Event2[];
  }

  export interface TransactionResponse {
    txs: Tx[];
    tx_responses: TxRespons[];
    pagination?: any;
  }
}
