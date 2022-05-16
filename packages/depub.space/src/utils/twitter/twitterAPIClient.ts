import axios from 'axios';

export const twitterAPIClient = axios.create({
  baseURL: 'https://api.twitter.com',
});
