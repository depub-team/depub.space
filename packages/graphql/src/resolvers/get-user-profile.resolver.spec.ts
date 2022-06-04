import { Context } from '../context';
import { UserProfile } from './generated_types';
import { getDesmosProfileResolver } from './get-desmos-profile.resolver';
import { getUserProfileResolver } from './get-user-profile.resolver';

jest.mock('./get-desmos-profile.resolver');

const mockDesmosProfileResolver = getDesmosProfileResolver as jest.MockedFunction<
  typeof getDesmosProfileResolver
>;

describe('getUserProfileResolver()', () => {
  const testAddress = 'like1arxf43t672dxh26zqa6y0wzwcd85xm6fvxmawr';
  const mockUserProfileStubFetchJson = jest.fn();
  const mockStargazeAPIGetNFTsByOwner = jest.fn();
  const mockOmniFlixAPIGetNFTsByOwner = jest.fn();

  const mockUserProfileStubFetch = jest.fn<
    {
      status: number;
      json: () => Promise<{ getUserProfile: UserProfile }>;
    },
    any[]
  >(() => ({
    status: 404,
    json: mockUserProfileStubFetchJson,
  }));

  const ctx = {
    env: {
      USER_PROFILE: {
        idFromName: jest.fn(() => 'user-profile'),
        get: () => ({
          fetch: mockUserProfileStubFetch,
        }),
      },
    },
    dataSources: {
      stargazeAPI: {
        getNFTsByOwner: mockStargazeAPIGetNFTsByOwner,
      },
      omniflixAPI: {
        getNFTsByOwner: mockOmniFlixAPIGetNFTsByOwner,
      },
    },
  } as any as Context;

  beforeEach(() => {
    mockDesmosProfileResolver.mockReturnValue(
      Promise.resolve({
        id: 'foo',
        address: 'cosmos1arxf43t672dxh26zqa6y0wzwcd85xm6fl68ldc',
        profilePic: 'https://desmos.network/profile-pic.png',
        coverPic: 'https://desmos.network/cover-pic.png',
        bio: 'I am a bio',
        nickname: 'desmos',
        profilePicProvider: 'desmos',
        dtag: 'desmos',
        creationTime: '2019-01-01T00:00:00Z',
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the user profile with desmos profile picture when desmos profile available', async () => {
    const userProfile = await getUserProfileResolver({ dtagOrAddress: testAddress }, ctx);

    expect(userProfile).toEqual(
      expect.objectContaining({
        address: testAddress,
        profilePic: 'https://desmos.network/profile-pic.png',
        profilePicProvider: 'desmos',
      })
    );
  });

  it('should return the basic user profile picture when desmos profile unavailable', async () => {
    mockDesmosProfileResolver.mockReturnValue(Promise.resolve(null));

    const userProfile = await getUserProfileResolver({ dtagOrAddress: testAddress }, ctx);

    expect(userProfile).toEqual(
      expect.objectContaining({
        address: testAddress,
      })
    );
    expect(userProfile.profilePic).toBeUndefined();
    expect(userProfile.profilePicProvider).toBeUndefined();
  });

  it('should return the user profile with Stargaze profile picture when profile picture provider is Stargaze and the NFT available', async () => {
    mockUserProfileStubFetchJson.mockResolvedValue({
      userProfile: {
        profilePic: 'https://stargaze.network/profile-pic.png',
        profilePicProvider: 'stargaze',
      },
    });
    mockUserProfileStubFetch.mockReturnValueOnce({
      status: 200,
      json: mockUserProfileStubFetchJson,
    });
    mockStargazeAPIGetNFTsByOwner.mockResolvedValue([
      {
        mediaType: 'image/png',
        media: 'https://stargaze.network/profile-pic.png',
      },
    ]);

    const userProfile = await getUserProfileResolver({ dtagOrAddress: testAddress }, ctx);

    expect(userProfile).toEqual(
      expect.objectContaining({
        profilePic: 'https://stargaze.network/profile-pic.png',
        profilePicProvider: 'stargaze',
      })
    );
    expect(mockStargazeAPIGetNFTsByOwner.mock.calls[0][0]).toEqual(
      expect.stringContaining('stars1')
    );
  });

  it('should return the user profile with Omniflix profile picture when profile picture provider is Omniflix and the NFT available', async () => {
    mockUserProfileStubFetchJson.mockResolvedValue({
      userProfile: {
        profilePic: 'https://omniflix.network/profile-pic.png',
        profilePicProvider: 'omniflix',
      },
    });
    mockUserProfileStubFetch.mockReturnValueOnce({
      status: 200,
      json: mockUserProfileStubFetchJson,
    });
    mockOmniFlixAPIGetNFTsByOwner.mockResolvedValue([
      {
        mediaType: 'image/png',
        media: 'https://omniflix.network/profile-pic.png',
      },
    ]);

    const userProfile = await getUserProfileResolver({ dtagOrAddress: testAddress }, ctx);

    expect(userProfile).toEqual(
      expect.objectContaining({
        profilePic: 'https://omniflix.network/profile-pic.png',
        profilePicProvider: 'omniflix',
      })
    );
    expect(mockOmniFlixAPIGetNFTsByOwner.mock.calls[0][0]).toEqual(
      expect.stringContaining('omniflix1')
    );
  });

  it('should return the user profile without profile picture when profile picture provider is Stargaze and the NFT unavailable', async () => {
    mockUserProfileStubFetchJson.mockResolvedValue({
      userProfile: {
        profilePic: 'https://stargaze.network/profile-pic.png',
        profilePicProvider: 'stargaze',
      },
    });
    mockUserProfileStubFetch.mockReturnValueOnce({
      status: 200,
      json: mockUserProfileStubFetchJson,
    });
    mockStargazeAPIGetNFTsByOwner.mockResolvedValue([]);

    const userProfile = await getUserProfileResolver({ dtagOrAddress: testAddress }, ctx);

    // fallback to desmos profile pic
    expect(userProfile.profilePic).toEqual('https://desmos.network/profile-pic.png');
    expect(userProfile.profilePicProvider).toEqual('desmos');

    expect(mockUserProfileStubFetch.mock.calls[1][0].method).toEqual('PATCH');
  });

  it('should return the user profile with Omniflix profile picture when profile picture provider is Omniflix and the NFT available', async () => {
    mockUserProfileStubFetchJson.mockResolvedValue({
      userProfile: {
        profilePic: 'https://omniflix.network/profile-pic.png',
        profilePicProvider: 'omniflix',
      },
    });
    mockUserProfileStubFetch.mockReturnValueOnce({
      status: 200,
      json: mockUserProfileStubFetchJson,
    });
    mockOmniFlixAPIGetNFTsByOwner.mockResolvedValue([
      {
        mediaType: 'image/png',
        media: 'https://omniflix.network/profile-pic.png',
      },
    ]);

    const userProfile = await getUserProfileResolver({ dtagOrAddress: testAddress }, ctx);

    expect(userProfile).toEqual(
      expect.objectContaining({
        profilePic: 'https://omniflix.network/profile-pic.png',
        profilePicProvider: 'omniflix',
      })
    );
    expect(mockOmniFlixAPIGetNFTsByOwner.mock.calls[0][0]).toEqual(
      expect.stringContaining('omniflix1')
    );
  });

  it('should return the user profile without profile picture when profile picture provider is OmniFlix and the NFT unavailable', async () => {
    mockUserProfileStubFetchJson.mockResolvedValue({
      userProfile: {
        profilePic: 'https://omniflix.network/profile-pic.png',
        profilePicProvider: 'omniflix',
      },
    });
    mockUserProfileStubFetch.mockReturnValueOnce({
      status: 200,
      json: mockUserProfileStubFetchJson,
    });
    mockOmniFlixAPIGetNFTsByOwner.mockResolvedValue([]);

    const userProfile = await getUserProfileResolver({ dtagOrAddress: testAddress }, ctx);

    // fallback to desmos profile pic
    expect(userProfile.profilePic).toEqual('https://desmos.network/profile-pic.png');
    expect(userProfile.profilePicProvider).toEqual('desmos');

    expect(mockUserProfileStubFetch.mock.calls[1][0].method).toEqual('PATCH');
  });
});
