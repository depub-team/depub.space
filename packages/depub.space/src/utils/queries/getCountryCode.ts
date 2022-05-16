import axios from 'axios';

const COUNTRY_CODE_URL = process.env.NEXT_PUBLIC_COUNTRY_CODE_URL;

if (!COUNTRY_CODE_URL) {
  throw new Error('COUNTRY_CODE_URL is not defined');
}

export const getCountryCode = async (): Promise<string> => {
  let countryCode = 'unknown';

  try {
    const res = await axios.get<{ country: string }>(COUNTRY_CODE_URL);

    countryCode = res.data.country;
  } catch {
    // do nothing here
  }

  return countryCode;
};
