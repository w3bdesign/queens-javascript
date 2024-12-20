import { vi } from 'vitest';

declare global {
  interface Window {
    Event: typeof Event;
  }
  var global: typeof globalThis;
}

// Mock DOM APIs
const mockDocument = {
  createElement: vi.fn(() => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  createEvent: vi.fn(() => new window.Event('event')),
  dispatchEvent: vi.fn(() => new window.Event('event')),
  getElementById: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  body: {
    appendChild: vi.fn(),
    innerHTML: '',
  },
};

global.document = mockDocument as unknown as Document;
