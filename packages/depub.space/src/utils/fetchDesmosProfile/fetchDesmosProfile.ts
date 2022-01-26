import { DesmosProfile } from '@desmoslabs/sdk-core';
import axios from 'axios';
import { DesmosProfileLinkDocument } from './desmosProfile.graphql';

const PROFILE_API = 'https://gql.mainnet.desmos.network/v1/graphql';
const cachedProfiles = new Map<string, DesmosProfile>();

export const fetchDesmosProfile = async (address: string): Promise<DesmosProfile | null> => {
  if (cachedProfiles.has(address)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cachedProfiles.get(address)!;
  }

  try {
    const { data } = await axios.post(PROFILE_API, {
      variables: {
        address,
      },
      query: DesmosProfileLinkDocument,
    });

    cachedProfiles.set(address, data.data);

    return data.data;
  } catch (error) {
    return null;
  }
};
