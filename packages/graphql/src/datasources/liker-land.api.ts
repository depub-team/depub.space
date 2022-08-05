import { DataSource } from 'apollo-datasource';
import { LikerProfile } from '../interfaces';

export class LikerLandApi extends DataSource {
  constructor(protected apiUrl: string) {
    // eslint-disable-next-line no-console
    console.info(`LikerLandApi(apiUrl: ${apiUrl})`);

    super();
  }

  public async getProfile(address: string): Promise<LikerProfile> {
    const res = await fetch(`${this.apiUrl}/users/addr/${address}/min`);

    const json = await res.json<LikerProfile>();

    return { ...json, __typename: 'LikerProfile' };
  }

  public async getProfileByDtag(dtag: string): Promise<LikerProfile> {
    const res = await fetch(`${this.apiUrl}/users/id/${dtag}/min`);

    const json = await res.json<LikerProfile>();

    return { ...json, __typename: 'LikerProfile' };
  }
}
