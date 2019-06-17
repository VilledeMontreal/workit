module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    "globals": {
      "__DEV__": true
    },
    "testMatch": [ "**/tests/**/*.spec.ts" ],
    "rootDir": ".",
    coverageReporters: ["json", "text"],
    testPathIgnorePatterns: ['node_modules', 'dist']
  };