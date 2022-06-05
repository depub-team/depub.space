import { makeSignDoc, pubkeyToAddress, serializeSignDoc, StdSignDoc } from '@cosmjs/amino';
import { Secp256k1, Secp256k1Signature, sha256 } from '@cosmjs/crypto';
import { fromBase64 } from '@cosmjs/encoding';

function makeADR036AminoSignDoc(message: string, pubKey: string, prefix: string): StdSignDoc {
  const signer = pubkeyToAddress(
    {
      type: 'tendermint/PubKeySecp256k1',
      value: pubKey,
    },
    prefix
  );

  return makeSignDoc(
    [
      {
        type: 'sign/MsgSignData',
        value: {
          signer,
          data: Buffer.from(message, 'utf8').toString('base64'),
        },
      },
    ],
    {
      gas: '0',
      amount: [],
    },
    '',
    '',
    0,
    0
  );
}

export const verifyArbitrary = async (
  message: string,
  pubKey: string,
  signature: string,
  prefix: string
): Promise<boolean> => {
  try {
    const signBytes = serializeSignDoc(makeADR036AminoSignDoc(message, pubKey, prefix));
    const messageHash = sha256(signBytes);
    const parsedSignature = Secp256k1Signature.fromFixedLength(fromBase64(signature));
    const parsedPubKey = fromBase64(pubKey);

    return await Secp256k1.verifySignature(parsedSignature, messageHash, parsedPubKey);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return false;
};
