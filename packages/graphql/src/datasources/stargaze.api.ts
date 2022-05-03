import { DataSource } from 'apollo-datasource';
import { CosmWasmClient } from 'cosmwasm';

interface Token {
  address: string;
  tokenId: string;
}

export class StargazeAPI extends DataSource {
  constructor(private readonly rpcEndpoint: string) {
    super();
  }

  public async getNFTs(address: string): Promise<Token[]> {
    const client = await CosmWasmClient.connect(this.rpcEndpoint);

    const txs = await client.searchTx({ tags: [] });

    console.log(txs);

    const contracts = await client.getContracts(1); // The code ID for sg721
    const tokens: Token[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const contract of contracts) {
      // eslint-disable-next-line no-await-in-loop
      const nfts = (await client.queryContractSmart(contract, {
        tokens: {
          owner: address,
        },
      })) as { tokens: string[] };

      tokens.concat(
        nfts.tokens.map<Token>(tokenId => ({
          address: contract,
          tokenId,
        }))
      );
    }

    return tokens;
  }
}
