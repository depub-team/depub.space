// @generated: @expo/next-adapter@3.1.10
// Learn more: https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/guides/using-nextjs.md#shared-steps

module.exports = {
  presets: ["@expo/next-adapter/babel"],
  plugins: [
    ['@babel/plugin-transform-react-constant-elements'],
    ["@babel/plugin-proposal-private-methods", { loose: true }],
    ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
    [
      "module-resolver", {
        alias: {
          '@depub/theme': '../theme/src/index.ts'
        }
      }
    ],
    'react-native-reanimated/plugin'
  ],
};