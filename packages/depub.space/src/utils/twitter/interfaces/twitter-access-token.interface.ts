export interface TwitterAccessToken {
  token_type: string; // bearer
  expires_in: number;
  access_token: string;
  scope: string;
  expires_at: Date;
}
