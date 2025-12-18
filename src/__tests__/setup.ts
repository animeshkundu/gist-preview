import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn((key: string, defaultValue: unknown) => {
    const store = new Map<string, unknown>();
    const value = store.has(key) ? store.get(key) : defaultValue;
    const setValue = vi.fn((newValue: unknown) => {
      if (typeof newValue === 'function') {
        store.set(key, (newValue as (prev: unknown) => unknown)(store.get(key) ?? defaultValue));
      } else {
        store.set(key, newValue);
      }
    });
    const deleteValue = vi.fn(() => store.delete(key));
    return [value, setValue, deleteValue];
  }),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    href: 'http://localhost:3000/',
  },
  writable: true,
});

globalThis.fetch = vi.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined),
  },
});

class ClipboardItemMock {
  constructor(public items: Record<string, Blob>) {}
}

globalThis.ClipboardItem = ClipboardItemMock as unknown as typeof ClipboardItem;

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;
