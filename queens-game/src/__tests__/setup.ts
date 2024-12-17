import { vi, afterEach, beforeAll } from 'vitest';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

// Mock preventDefault and stopPropagation on Event prototype
beforeAll(() => {
  // @ts-ignore - Modifying Event prototype for testing
  Event.prototype.preventDefault = vi.fn();
  // @ts-ignore - Modifying Event prototype for testing
  Event.prototype.stopPropagation = vi.fn();
});

// Clean up the DOM after each test
afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});