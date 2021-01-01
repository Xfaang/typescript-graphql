/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
module.exports = {
  clearMocks: true,
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '.tsx?': '<rootDir>/jest.transformer.typescript.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/config/setupAfterEnv.ts'],
};
