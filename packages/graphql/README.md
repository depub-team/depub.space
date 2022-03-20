# Apollo GraphQL server

This is an API layer for front-end, it's utilized Cloudflare Durable Object to cache ISCN transactions in order to reduce rpc calls, this server will not make any changes to ISCN records on blockchain.

## Deployment

This project deploying to Cloudflare workers with Github action as a CI/CD.

### Production

`yarn deploy:prod`

### Staging

`yarn deploy:stag`

## Development

Running on local environment with Miniflare

`yarn dev`
