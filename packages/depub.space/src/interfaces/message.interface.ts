export interface Message {
  id: string;
  message: string;
  from: string;
  date: Date;
  profilePic?: string;
  dtag?: string;
  nickname?: string;
}
