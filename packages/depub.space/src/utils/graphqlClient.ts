import axios from 'axios';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export const graphqlClient = axios.create({
  baseURL: GRAPHQL_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  timeout: 5000,
});
