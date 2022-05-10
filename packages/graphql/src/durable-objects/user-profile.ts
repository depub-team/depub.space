import { UserProfile as IUserProfile } from '../resolvers/generated_types';
import { Bindings } from '../../bindings';

const USER_PROFILE_KEY = 'profile';

export class UserProfile implements DurableObject {
  constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {}

  public async updateUserProfile(request: Request) {
    const profileToUpdate = await request.json<Partial<IUserProfile>>();
    const url = new URL(request.url.replace(/^\//, ''));
    const address = decodeURIComponent(url.pathname.split('/').pop() || '');
    const userProfileKey = `${USER_PROFILE_KEY}:${address}`;
    const userProfile = await this.state.storage.get<IUserProfile>(userProfileKey);
    const updatedProfile = {
      ...userProfile,
      ...profileToUpdate,
    };

    if (!userProfile) {
      return new Response('User profile not found', { status: 404 });
    }

    this.state.storage.put(userProfileKey, updatedProfile);

    return new Response(JSON.stringify(updatedProfile));
  }

  public async createUserProfile(request: Request) {
    const profileToCreate = await request.json<IUserProfile>();

    if (!profileToCreate.address) {
      return new Response('Address is required', { status: 400 });
    }

    const { address } = profileToCreate;
    const userProfileKey = `${USER_PROFILE_KEY}:${address}`;

    this.state.storage.put(userProfileKey, profileToCreate);

    return new Response(undefined, { status: 201 });
  }

  public async getUserProfile(request: Request) {
    const url = new URL(request.url.replace(/^\//, ''));
    const address = decodeURIComponent(url.pathname.split('/').pop() || '');
    const userProfileKey = `${USER_PROFILE_KEY}:${address}`;
    const isValidAddress = !/^(cosmos1|like1)/.test(address);

    if (!isValidAddress) {
      return new Response('Invalid address', { status: 400 });
    }

    const userProfile = await this.state.storage.get<IUserProfile>(userProfileKey);

    if (!userProfile) {
      return new Response('User profile not found', { status: 404 });
    }

    return new Response(
      JSON.stringify({
        userProfile,
      })
    );
  }

  public async fetch(request: Request) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith('/profiles/')) {
        if (request.method === 'PATCH') {
          return await this.updateUserProfile(request);
        }

        if (request.method === 'GET') {
          return await this.getUserProfile(request);
        }
      } else if (url.pathname === '/profiles') {
        if (request.method === 'POST') {
          return await this.createUserProfile(request);
        }
      }
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);

      return new Response(
        JSON.stringify({
          error: ex instanceof Error ? ex.message : 'Unknown error',
        }),
        { status: 500 }
      );
    }

    return new Response(undefined, { status: 403 });
  }
}
