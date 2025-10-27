/**
 * Jest setup file for global test configuration
 */

// Silence console output during tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Extend Jest matchers if needed
beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global cleanup after all tests
});

// Set longer timeout for integration tests
jest.setTimeout(10000);
