![depub.space](/packages/depub.space/public/app-logo.png)

# DePub

This is monorepo for depub products

## Packages

### depub.space

- Production: [https://depub.space](https://depub.space)
- Staging: [https://stag.depub.space](https://stag.depub.space)

### Theme

Common theme definition and components based on [Native Base](https://nativebase.io/).

## Development

This monorepo used yarn workspace to manage dependencies and packages please do `yarn install` to initialize the package linking and install dependencies.

### WalletConnect

WalletConnect only works with SSL enabled URL, so use it with localhost would getting error, you could use a tunnel service(eg: ngrok) to running the website with https url.

### Arweave

Upload file to Arweave with ISCN doesn't work in testnet.

### Cloudflare route rewrite

Since this project used IPFS as a static file hosting, the NextJS dynamic route is not applicable without backend rendering, we've created a worker on Cloudflare to rewrite the all URL request to index, and utilized [React-Navigation](https://reactnavigation.org/) to handle navigation logic.

### Environment Variables

Please find the .env.sample under individual package.

## Deployment

- **_depub.space_** is deploying to IPFS via fleek.co
