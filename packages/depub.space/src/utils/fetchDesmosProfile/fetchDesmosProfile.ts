import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DesmosProfileLinkDocument } from './desmosProfile.graphql';

export interface DesmosProfile {
  address: string;
  applicationLinks: [];
  bio: string;
  chainLinks: [];
  coverPic: string;
  creationTime: string; // ISO timestamp
  dtag: string;
  nickname: string;
  profilePic: string;
}

const DESMOS_PROFILE_CACHE = '@DESMOS_PROFILE_CACHE';
const CACHE_TTL = 24 * 60 * 60 * 1000;
const PROFILE_API = 'https://gql.mainnet.desmos.network/v1/graphql';

export const fetchDesmosProfile = async (address: string): Promise<DesmosProfile | null> => {
  const cacheKey = `${DESMOS_PROFILE_CACHE}/${address}`;
  const cachedSerializedProfile = await AsyncStorage.getItem(cacheKey);

  if (cachedSerializedProfile) {
    // check is the cache expired
    const { profile, expiration } = JSON.parse(cachedSerializedProfile) as {
      profile: DesmosProfile;
      expiration: number;
    };
    const now = new Date();

    if (now.getTime() < expiration) {
      return profile;
    }
  }

  try {
    const { data } = await axios.post(PROFILE_API, {
      variables: {
        address,
      },
      query: DesmosProfileLinkDocument,
    });

    if (data.data.profile[0]) {
      const serializedProfile = JSON.stringify({
        expiration: new Date().getTime() + CACHE_TTL,
        profile: data.data.profile[0],
      });

      await AsyncStorage.setItem(cacheKey, serializedProfile);

      return data.data.profile[0];
    }

    return null;
  } catch (error) {
    return null;
  }
};
