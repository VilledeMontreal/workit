module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  "globals": {
    "__DEV__": true
  },
  "rootDir": ".",
  coverageReporters: ["json", "text"],
  testPathIgnorePatterns: ['node_modules', 'lib'],
  setupFilesAfterEnv: ['./jest.setup.js']
};
