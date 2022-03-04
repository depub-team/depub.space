/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
// @generated: @expo/next-adapter@3.1.10
// Learn more: https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/guides/using-nextjs.md#withexpo

const { withExpo } = require("@expo/next-adapter");
const withFonts = require("next-fonts");
const nextBuildId = require('next-build-id');
const withPlugins = require("next-compose-plugins");
const { withSentryConfig } = require('@sentry/nextjs');
const withTM = require("next-transpile-modules")([
  "react-native-web",
  "native-base",
  '@depub/theme'
]);

const SentryWebpackPluginOptions = {};

const nextConfig = {
  webpack5: true,
  generateBuildId: () => nextBuildId({ dir: __dirname }),
  rewrites () {
    return [
      {
        source: '/(.*)', // react-navigation root
        destination: '/'
      },
    ]
  },
};

module.exports = withPlugins(
  [
    withTM,
    [withFonts, { projectRoot: __dirname }],
    [withExpo, { projectRoot: __dirname }],
    (cfg) => withSentryConfig(cfg, SentryWebpackPluginOptions),
  ],
  nextConfig
);
/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */