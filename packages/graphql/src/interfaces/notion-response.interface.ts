export interface CreatedBy {
  object: string;
  id: string;
}

export interface LastEditedBy {
  object: string;
  id: string;
}

export interface External {
  url: string;
}

export interface Cover {
  type: 'cover';
  external: External;
}

export interface Icon {
  type: 'icon';
  emoji: string;
}

export interface Parent {
  type: 'parent';
  database_id: string;
}

export interface SelectObject {
  id: string;
  name: string;
  color: string;
}

export interface SelectType {
  id: string;
  type: 'select';
  select: SelectObject;
}

export interface CheckboxType {
  id: string;
  type: 'checkbox';
  checkbox: boolean;
}

export interface DateObject {
  start: string;
  end?: any;
  time_zone?: any;
}

export interface DateType {
  id: string;
  type: 'date';
  date: DateObject;
}

export interface NumberType {
  id: string;
  type: 'number';
  number: number;
}

export interface RelationObject {
  id: string;
}

export interface RelationType {
  id: string;
  type: 'relation';
  relation: RelationObject[];
}

export interface FormulaObject {
  type: string;
  number: number;
}

export interface FormulaType {
  id: string;
  type: 'formula';
  formula: FormulaObject;
}

export interface TextObject {
  content: string;
  link?: any;
}

export interface MultiSelectType {
  id: string;
  type: 'multi_select';
  multi_select: SelectObject[];
}

export interface AnnotationsType {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface TextType {
  type: 'text';
  text: TextObject;
  annotations: AnnotationsType;
  plain_text: string;
  href?: any;
}

export interface TitleType {
  id: string;
  type: 'title';
  title: TextType[];
}

export interface Properties {
  [K: string]:
    | TitleType
    | TextType
    | FormulaType
    | NumberType
    | RelationType
    | MultiSelectType
    | SelectType;
}

export interface Result<P extends Properties> {
  object: string;
  id: string;
  created_time: Date;
  last_edited_time: Date;
  created_by: CreatedBy;
  last_edited_by: LastEditedBy;
  cover: Cover;
  icon: Icon;
  parent: Parent;
  archived: boolean;
  properties: P;
  url: string;
}

export interface NotionResponse<P extends Properties> {
  object: string;
  results: Result<P>[];
  next_cursor?: any;
  has_more: boolean;
  type: string;
  page: any;
}
