// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pathsToModuleNameMapper } = require('ts-jest');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  roots: [
    '<rootDir>'
  ],
  projects: [
    '<rootDir>/packages/depub.space/jest.config.json',
    '<rootDir>/packages/graphql/jest.config.json'
  ],
  testEnvironment: 'jsdom',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'json'
  ],
  coverageReporters: [
    'json',
    'lcov',
    'text',
    'clover'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/**/src/**/*.interface.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  testMatch: [
    '**/*.(spec|test).ts?(x)',
    '**/*.(spec|test).js?(x)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(
      compilerOptions.paths /* , { prefix: '<rootDir>/' }, */,
    ),
  },
}