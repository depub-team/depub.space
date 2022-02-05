export interface Message {
  id: string;
  from: string;
  date: Date;
  message?: string;
  images?: string[];
}
