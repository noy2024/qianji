module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['jest-fetch-mock/setupJest.js'],
  moduleNameMapper: {
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
  },
};