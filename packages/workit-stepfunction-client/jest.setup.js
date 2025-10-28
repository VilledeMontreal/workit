// Jest setup for memory management in Node.js 20
// Force garbage collection after each test to prevent memory buildup

// Increase heap size warnings threshold
if (typeof global.gc === 'function') {
  afterEach(() => {
    // Force garbage collection if available
    global.gc();
  });
}

// Set Node.js specific options for better memory handling
process.setMaxListeners(0);

// Handle large payload tests by limiting memory usage
beforeAll(() => {
  // Set environment variable to reduce payload size for tests if not already set
  if (!process.env.WORKIT_STEP_FUNCTION_MAX_PAYLOAD_LENGTH) {
    process.env.WORKIT_STEP_FUNCTION_MAX_PAYLOAD_LENGTH = '65536'; // 64KB instead of 256KB
  }
});

// Clean up after all tests
afterAll(() => {
  // Clean up any remaining resources
  if (typeof global.gc === 'function') {
    global.gc();
  }
});