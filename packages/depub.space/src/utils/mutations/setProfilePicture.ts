import { UserProfile } from '../../interfaces';
import { graphqlClient } from '../graphqlClient';
import { GRAPHQL_MUTATION_SET_PROFILE_PICTURE } from '../../constants';

export interface SetProfilePictureResponse {
  setProfilePicture: UserProfile | null;
}

export const setProfilePicture = async (
  address: string,
  picture: string,
  provider: string,
  authHeader: string
): Promise<UserProfile | null> => {
  const { data } = await graphqlClient.post<{
    data: SetProfilePictureResponse;
    errors?: { message: string }[];
  }>(
    '',
    {
      variables: {
        picture,
        provider,
        address,
      },
      query: GRAPHQL_MUTATION_SET_PROFILE_PICTURE,
    },
    {
      headers: {
        Authorization: `Bearer ${authHeader}`,
      },
    }
  );

  if (data.data.setProfilePicture) {
    return data.data.setProfilePicture;
  }

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return null;
};
