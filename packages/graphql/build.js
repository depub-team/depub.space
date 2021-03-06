import path from 'path';
import { fileURLToPath } from 'url';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

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

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* eslint-enable @typescript-eslint/naming-convention, no-underscore-dangle */

const src = path.join(__dirname, 'src', 'index.ts');
const entryPoints = [src];

if (process.argv[2] === 'test') {
  // eslint-disable-next-line no-restricted-syntax
  for await (const test of walk(path.join(__dirname, 'src'))) {
    if (test.endsWith('.spec.ts')) entryPoints.push(test)
  }
}

try {
  await build({
    bundle: true,
    sourcemap: false,
    minify: false,
    format: 'esm',
    target: ['esnext'],
    entryPoints,
    outdir: path.join(__dirname, 'dist'),
    outExtension: { '.js': '.mjs' },
    define: {
      global: 'globalThis',
    },
    plugins: [
      NodeModulesPolyfillPlugin(),
      NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true
      }),
    ],
  });
} catch (ex) {
  // eslint-disable-next-line no-console
  console.error(ex);

  process.exitCode = 1;
}
