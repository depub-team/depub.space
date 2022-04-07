import axios from 'axios';

export const getCountryCode = async (): Promise<string> => {
  let countryCode = 'unknown';

  try {
    const res = await axios.get<{ country: string }>(
      'https://country-code.decentralizehk.workers.dev/'
    );

    countryCode = res.data.country;
  } catch {
    // do nothing here
  }

  return countryCode;
};
