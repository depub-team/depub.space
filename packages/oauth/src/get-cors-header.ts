const whitelistOrigins = [
  'http://localhost:3000',
  'http://localhost:8787',
  'https://depub.space',
  'https://stag.depub.space',
];

export const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin');
  const headers = new Headers();

  if (!origin || !whitelistOrigins.includes(origin)) {
    return headers;
  }

  headers.append('Access-Control-Allow-Origin', origin);
  headers.append('Access-Control-Allow-Methods', 'GET,HEAD,POST,DELETE,OPTIONS');
  headers.append('Access-Control-Max-Age', '86400');

  return headers;
};

export const handleOptions = (request: Request) => {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  const { headers } = request;

  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    const accessControlRequestHeaders = request.headers.get('Access-Control-Request-Headers');
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    const respHeaders = {
      ...getCorsHeaders(request),
      ...(accessControlRequestHeaders
        ? {
            // Allow all future content Request headers to go back to browser
            // such as Authorization (Bearer) or X-Client-Name-Version
            'Access-Control-Allow-Headers': accessControlRequestHeaders,
          }
        : undefined),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  }

  // Handle standard OPTIONS request.
  // If you want to allow other HTTP Methods, you can do that here.
  return new Response(null, {
    headers: {
      ...getCorsHeaders(request),
      Allow: 'GET, HEAD, DELETE, POST, OPTIONS',
    },
  });
};
