import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { NFTAsset, StargazeNFT } from '../interfaces';
import type { Context } from '../context';

export class StargazeAPI extends DataSource {
  protected context!: Context;

  constructor(private readonly restEndpoint: string) {
    super();
  }

  public initialize(config: DataSourceConfig<Context>): Promise<void> {
    this.context = config.context;

    return Promise.resolve();
  }

  public async getAllOwnedTokens(ownerAddress: string): Promise<StargazeNFT[]> {
    const requestUrl = `${this.restEndpoint}api/v1beta/profile/${ownerAddress}/nfts`;

    try {
      const resp = await fetch(requestUrl);
      const json = await resp.json();

      return json as StargazeNFT[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    return [];
  }

  public async getNFTsByOwner(address: string): Promise<NFTAsset[]> {
    const cacheKey = `stargaze:owner:${address}`;
    const cachedTokens = await this.context.env.NFT_CONTRACTS_CACHE.get(cacheKey);

    if (cachedTokens) {
      return JSON.parse(cachedTokens);
    }

    const tokens = (await this.getAllOwnedTokens(address)).map(token => ({
      media: token.image,
      mediaType: 'image',
      tokenId: token.tokenId,
      name: token.collection.name,
      address: token.collection.contractAddress,
    }));

    console.log('tokens =', tokens);

    await this.context.env.NFT_CONTRACTS_CACHE.put(cacheKey, JSON.stringify(tokens), {
      expirationTtl: 60 * 1, // 1 mins
    });

    return tokens;
  }
}
