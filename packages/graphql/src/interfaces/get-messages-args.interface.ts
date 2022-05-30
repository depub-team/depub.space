import type { InputMaybe } from '../resolvers/generated_types';

export interface GetMessagesArgs {
  limit?: InputMaybe<number>;
  previousId?: InputMaybe<string>;
  tag?: InputMaybe<string>;
  author?: InputMaybe<string>;
  mentioned?: InputMaybe<string>;
}
