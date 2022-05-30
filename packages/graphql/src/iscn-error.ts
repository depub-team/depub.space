import { ApolloError } from 'apollo-server-errors';

export class ISCNError extends ApolloError {
  constructor(message: string) {
    super(message, 'ISCN_ERROR');

    Object.defineProperty(this, 'name', { value: 'ISCNError' });
  }
}
