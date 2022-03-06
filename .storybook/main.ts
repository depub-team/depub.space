import path from 'path';
import type { StorybookConfig } from '@storybook/core-common';
import webpack from 'webpack';

const main: StorybookConfig = {
  core: {
    builder: 'webpack5',
  },

  stories: ['../packages/**/*.stories.tsx'],

  staticDirs: ['../packages/depub.space/public'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-react-native-web',
    'storybook-dark-mode',
  ],

  framework: '@storybook/react',

  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop: any) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  webpackFinal: async (config: any) => {
    config.resolve.alias['@depub/theme'] = path.resolve(__dirname, '../packages/theme/src');

    config.resolve.alias['react-native$'] = 'react-native-web';

    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve('process/browser'),
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      buffer: require.resolve('buffer'),
      asset: require.resolve('assert'),
    };

    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
    ];

    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      loader: '@svgr/webpack',
      options: {
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: { removeViewBox: false },
              },
            },
          ],
        },
      },
    });

    return config;
  },
};

export default main;
