import { OfflineDirectSigner, AccountData, DirectSignResponse } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

export class CosmoStationDirectSigner implements OfflineDirectSigner {
  /**
   *
   */
  constructor(private chainName: any) {}

  async getAccounts(): Promise<readonly AccountData[]> {
    const w = window as any;
    const account = await w.cosmostation.tendermint.request({
      method: 'ten_requestAccount',
      params: { chainName: this.chainName },
    });

    return [
      {
        address: account.address,
        algo: 'secp256k1',
        pubkey: account.publicKey,
      },
    ];
  }

  async signDirect(_signerAddress: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    const w = window as any;

    const doc = {
      chain_id: signDoc.chainId,
      body_bytes: signDoc.bodyBytes,
      auth_info_bytes: signDoc.authInfoBytes,
      account_number: signDoc.accountNumber.toString(),
    };

    const response = await w.cosmostation.tendermint.request({
      method: 'ten_signDirect',
      params: {
        chainName: this.chainName,
        doc,
        isEditFee: true,
        isEditMemo: true,
      },
    });

    const directResponse = {
      signature: {
        pub_key: response.pub_key,
        signature: response.signature,
      },
      signed: {
        accountNumber: signDoc.accountNumber,
        chainId: signDoc.chainId,
        authInfoBytes: response.signed_doc.auth_info_bytes,
        bodyBytes: response.signed_doc.body_bytes,
      },
    };

    return directResponse;
  }
}
