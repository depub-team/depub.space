import path from 'path';

const main = {
  stories: ['../packages/**/*.stories.tsx'],

  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],

  typescript: {
    check: false,
    reactDocgen: false,
  },

  webpackFinal: async (config: any) => {
    // Default rule for images /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => rule.test && rule.test.test('.svg')
    );
    fileLoaderRule.exclude = /\.svg$/;

    config.resolve.alias['@depub/theme'] = path.resolve(__dirname, '../packages/theme/src');

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
