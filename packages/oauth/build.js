/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, import/no-extraneous-dependencies */
import path from 'path';
import { fileURLToPath } from 'url';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import alias from 'esbuild-plugin-alias';

import { build } from 'esbuild';

export async function* walk (rootPath) {
  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of await fs.readdir(rootPath)) {
    const filePath = path.join(rootPath, fileName)

    // eslint-disable-next-line no-await-in-loop
    if ((await fs.stat(filePath)).isDirectory()) {
      yield* walk(filePath)
    } else {
      yield filePath
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, 'src', 'index.ts');
const entryPoints = [src];

if (process.argv[2] === 'test') {
  // eslint-disable-next-line no-restricted-syntax
  for await (const test of walk(path.join(__dirname, 'src'))) {
    if (test.endsWith('.spec.ts')) entryPoints.push(test)
  }
}

console.log(path.resolve(__dirname, '../../node_modules/crypto-browserify/index.js'));

try {
  await build({
    bundle: true,
    sourcemap: true,
    format: 'esm',
    target: ['esnext'],
    entryPoints,
    outdir: path.join(__dirname, 'dist'),
    outExtension: { '.js': '.mjs' },
    define: {
      global: 'globalThis',
    },
    plugins: [
      alias({
        'crypto': path.resolve(__dirname, '../../node_modules/crypto-browserify/index.js'),
      }),
      NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true
      }),
      NodeModulesPolyfillPlugin(),
    ],
  });
} catch (ex) {
  console.error(ex);

  process.exitCode = 1;
}
/* eslint-enable @typescript-eslint/naming-convention, no-underscore-dangle, import/no-extraneous-dependencies */