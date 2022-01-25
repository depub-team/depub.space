/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
// @generated: @expo/next-adapter@3.1.10
// Learn more: https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/guides/using-nextjs.md#withexpo

const { withExpo } = require("@expo/next-adapter");
const withFonts = require("next-fonts");
const withPlugins = require("next-compose-plugins");
const withTM = require("next-transpile-modules")([
  "react-native-web",
  "native-base",
]);

const nextConfig = {
  webpack5: true,
  trailingSlash: true,
};

module.exports = withPlugins(
  [
    withTM,
    [withFonts, { projectRoot: __dirname }],
    [withExpo, { projectRoot: __dirname }],
  ],
  nextConfig
);
/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */