import axios from 'axios';
import axiosRetry from 'axios-retry';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export const graphqlClient = axios.create({
  baseURL: GRAPHQL_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  timeout: 5000,
});

axiosRetry(graphqlClient as any, {
  retries: 3,
  shouldResetTimeout: true,
  retryDelay: retryCount => retryCount * 1000,
  retryCondition: _error => true,
});
