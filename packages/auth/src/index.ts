import jwt from '@tsndr/cloudflare-worker-jwt';
import { Bindings } from '../bindings';
import { verifyArbitrary } from './utils/verify-arbitrary';

export default {
  fetch: async (request: Request, env: Bindings) => {
    const corsHeaders = new Headers();
    const referer = request.headers.get('referer');
    const refererUrl = referer && new URL(referer);

    if (!refererUrl) {
      return new Response('', { status: 404 });
    }

    const allowedOrigin =
      /^https:\/\/.*(depub.space)$/.test(refererUrl.origin) ||
      refererUrl.origin.endsWith('localhost:3000')
        ? refererUrl.origin
        : 'https://depub.space';

    corsHeaders.set('Access-Control-Allow-Credentials', 'true');
    corsHeaders.set('Access-Control-Allow-Headers', '*');
    corsHeaders.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
    corsHeaders.set('Access-Control-Allow-Origin', allowedOrigin);

    try {
      if (request.method === 'OPTIONS') {
        return new Response('', { status: 204, headers: corsHeaders });
      }

      if (request.method === 'POST') {
        const contentType = request.headers.get('content-type') || '';
        const authHeader = request.headers.get('authorization') || '';
        const [, authSignatureAndPublicKey] = authHeader.split('Bearer ');
        const body = await request.json<{ prefix: string }>();

        if (
          !contentType.startsWith('application/json') || // must be json
          !body.prefix ||
          !authHeader ||
          !authSignatureAndPublicKey
        ) {
          return new Response('Unauthorized', {
            headers: corsHeaders,
            status: 401,
          });
        }

        const [authSignature, authPublicKey] = Buffer.from(authSignatureAndPublicKey, 'base64')
          .toString()
          .split('.');

        if (!authSignature || !authPublicKey) {
          return new Response('Unauthorized', {
            headers: corsHeaders,
            status: 401,
          });
        }

        // verify arbitrary message that was signed with the public key
        const verifySignature = await verifyArbitrary(
          env.SIGN_MESSAGE,
          authPublicKey,
          authSignature,
          body.prefix
        );

        if (!verifySignature) {
          return new Response('Unauthorized', {
            headers: corsHeaders,
            status: 401,
          });
        }

        // sign JWT token with
        const accessToken = await jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 mins
            publicKey: authPublicKey,
            prefix: body.prefix,
          },
          env.JWT_SECRET
        );

        return new Response(JSON.stringify({ accessToken }), { headers: corsHeaders });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    return new Response('Not found', {
      headers: corsHeaders,
      status: 404,
    });
  },
};
