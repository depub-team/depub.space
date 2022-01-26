import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { DesmosProfile } from '@desmoslabs/sdk-core';
import { DesmosProfileQuery } from './desmosProfile.query';
import {
  DesmosProfileDocument,
  DesmosProfileLinkDocument,
  DesmosProfileDtagDocument,
} from '../../utils/fetchDesmosProfile/desmosProfile.graphql';
import { DesmosProfileContext } from './desmosProfile.context';

const PROFILE_API = 'https://gql.mainnet.desmos.network/v1/graphql';

export const useDesmosProfile = (address: string) => {
  const [loading, setLoading] = useState(false);
  const [myProfile, setMyProfile] = useState<DesmosProfile | null>(null);
  const { cachedProfiles, setCachedProfiles } = useContext(DesmosProfileContext);

  const fetchDesmos = async (addr: string) => {
    try {
      const { data } = await axios.post(PROFILE_API, {
        variables: {
          address: addr,
        },
        query: DesmosProfileDocument,
      });

      return data.data;
    } catch (error) {
      return null;
    }
  };

  const fetchLink = async (addr: string) => {
    try {
      const { data } = await axios.post(PROFILE_API, {
        variables: {
          address: addr,
        },
        query: DesmosProfileLinkDocument,
      });

      return data.data;
    } catch (error) {
      return null;
    }
  };

  const fetchDtag = async (dtag: string) => {
    try {
      const { data } = await axios.post(PROFILE_API, {
        variables: {
          dtag,
        },
        query: DesmosProfileDtagDocument,
      });

      return data.data;
    } catch (error) {
      return null;
    }
  };

  const formatDesmosProfile = (data: DesmosProfileQuery): DesmosProfile | null => {
    if (!data.profile.length) {
      return null;
    }

    const profile = data.profile[0];

    return {
      address: profile.address,
      dtag: profile.dtag,
      nickname: profile.nickname,
      profilePicture: profile.profilePic,
      coverPicture: profile.coverPic,
      bio: profile.bio,
    };
  };

  const fetchDesmosProfile = async (input: string) => {
    let data: DesmosProfileQuery = {
      profile: [],
    };

    if (cachedProfiles && typeof cachedProfiles[input] !== 'undefined') {
      const cachedProfile = cachedProfiles[input];

      setMyProfile(cachedProfile);
    }

    try {
      setLoading(true);
      if (input.startsWith('@')) {
        data = await fetchDtag(input.substr(1));
      }

      if (input.startsWith('desmos')) {
        data = await fetchDesmos(input);
      }

      // if the address is a link instead
      if (!data.profile.length) {
        data = await fetchLink(input);
      }

      if (data) {
        const formattedData = formatDesmosProfile(data);

        if (setCachedProfiles)
          setCachedProfiles(
            profiles =>
              ({
                ...profiles,
                [input]: formattedData,
              } as Record<string, DesmosProfile>)
          );

        setMyProfile(formattedData);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      void fetchDesmosProfile(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return {
    loading,
    profile: myProfile,
  };
};
