

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // preset: 'ts-jest',
  preset: 'jest-puppeteer',
  testEnvironment: 'jest-environment-puppeteer',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/**/*.test.ts'],
};
