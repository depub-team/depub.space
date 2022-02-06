/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, import/no-extraneous-dependencies */
import path from 'path';
import { fileURLToPath } from 'url';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  await build({
    bundle: true,
    sourcemap: true,
    format: 'esm',
    target: ['esnext'],
    entryPoints: [path.join(__dirname, 'src', 'index.ts')],
    outdir: path.join(__dirname, 'dist'),
    outExtension: { '.js': '.mjs' },
    define: {
      global: 'globalThis',
    },
    plugins: [
      NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true
      }),
      NodeModulesPolyfillPlugin(),
    ],
  });
} catch {
  process.exitCode = 1;
}
/* eslint-enable @typescript-eslint/naming-convention, no-underscore-dangle, import/no-extraneous-dependencies */