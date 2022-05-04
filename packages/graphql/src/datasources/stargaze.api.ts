import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { CosmWasmClient } from 'cosmwasm';
import { NFTAsset } from '../interfaces';
import type { Context } from '../context';

interface TxnEvent {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
}

export class StargazeAPI extends DataSource {
  protected client!: CosmWasmClient;

  protected context!: Context;

  constructor(private readonly rpcEndpoint: string) {
    super();
  }

  public async initialize(config: DataSourceConfig<Context>): Promise<void> {
    this.context = config.context;
    this.client = await CosmWasmClient.connect(this.rpcEndpoint);
  }

  public async getContracts(): Promise<readonly string[]> {
    const cacheKey = 'stargaze:contracts';
    const cachedContracts = await this.context.env.NFT_CONTRACTS_CACHE.get(cacheKey);

    if (cachedContracts) {
      return JSON.parse(cachedContracts);
    }

    const contracts = await this.client.getContracts(1); // The code ID for sg721

    await this.context.env.NFT_CONTRACTS_CACHE.put(cacheKey, JSON.stringify(contracts), {
      expirationTtl: 60 * 60 * 24, // 24 hours
    });

    return contracts;
  }

  public async getNFTsByOwner(address: string): Promise<NFTAsset[]> {
    const cacheKey = `stargaze:owner:${address}`;
    const cachedTokens = await this.context.env.NFT_CONTRACTS_CACHE.get(cacheKey);

    if (cachedTokens) {
      return JSON.parse(cachedTokens);
    }

    const allContracts = await this.getContracts();
    const txs = await this.client.searchTx({
      tags: [{ key: 'wasm.recipient', value: address }],
    });
    const events = txs
      .map(tx => {
        try {
          const parsedLog = JSON.parse(tx.rawLog);

          return parsedLog[0].events as TxnEvent[];
        } catch {
          // do nothing
        }

        return [];
      })
      .reduce((acc, arr) => [...acc, ...arr], [])
      .filter(
        event =>
          event.type === 'wasm' &&
          event.attributes.some(
            attr => attr.key === '_contract_address' && allContracts.includes(attr.value)
          )
      );
    const contracts = new Set(
      events.map(
        e =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          e.attributes.find(
            attr => attr.key === '_contract_address' && allContracts.includes(attr.value)
          )!.value
      )
    );
    const result: NFTAsset[] = (
      await Promise.all(
        Array.from(contracts.values()).map(async contractAddress => {
          const queryResult = await this.client.queryContractSmart(contractAddress, {
            tokens: {
              owner: address,
            },
          });
          const tokens = await Promise.all(
            (queryResult.tokens || []).map(async (tokenId: string) => {
              const nftInfo = await this.client.queryContractSmart(contractAddress, {
                nft_info: {
                  token_id: tokenId,
                },
              });

              if (nftInfo.token_uri) {
                const metadataResponse = await fetch(
                  `https://cloudflare-ipfs.com/ipfs/${nftInfo.token_uri.split('ipfs://')[1]}`,
                  {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
                const metadata = await metadataResponse.json<any>();
                const extName = metadata.image.split('.').pop();
                const mediaType = `image/${extName === 'jpg' ? 'jpeg' : extName}`;

                return {
                  address: contractAddress,
                  media: metadata.image,
                  mediaType,
                  tokenId,
                } as NFTAsset;
              }

              return {};
            })
          );

          return tokens;
        })
      )
    ).reduce((acc, tokens) => [...acc, ...tokens], []);

    await this.context.env.NFT_CONTRACTS_CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 60 * 10, // 10 mins
    });

    return result;
  }
}
