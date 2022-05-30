import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { OmniflixNFTsByOwnerResponse, NFTAsset } from '../interfaces';
import type { Context } from '../context';

export class OmniflixAPI extends DataSource {
  protected context!: Context;

  constructor(private readonly restEndpoint: string) {
    super();
  }

  public initialize(config: DataSourceConfig<Context>): Promise<void> {
    this.context = config.context;

    return Promise.resolve();
  }

  public async getNFTsByOwner(address: string): Promise<NFTAsset[]> {
    const cacheKey = `omniflix:owner:${address}`;
    const cachedTokens = await this.context.env.NFT_CONTRACTS_CACHE.get(cacheKey);

    if (cachedTokens) {
      return JSON.parse(cachedTokens);
    }

    const response = await fetch(`${this.restEndpoint}nfts?owner=${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json<OmniflixNFTsByOwnerResponse>();
    const result = await Promise.all(
      data.result.list.map<NFTAsset>(ownerList => ({
        address: ownerList.denom_id.id,
        tokenId: ownerList.id,
        name: ownerList.denom_id.name,
        media: ownerList.media_uri,
        mediaType: ownerList.media_type,
      }))
    );

    await this.context.env.NFT_CONTRACTS_CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 60 * 1, // 1 mins
    });

    return result;
  }
}
