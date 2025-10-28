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
  // Node.js 20 compatibility settings
  maxWorkers: 1,
  workerIdleMemoryLimit: '256MB',
  testTimeout: 60000,
  // Additional memory management settings
  forceExit: true,
  detectOpenHandles: true
};
