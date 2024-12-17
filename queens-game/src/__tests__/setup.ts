import { vi, afterEach } from 'vitest';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

// Clean up the DOM after each test
afterEach(() => {
  document.body.innerHTML = '';
});