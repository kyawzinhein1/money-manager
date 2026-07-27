import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.scrollTo for jsdom environment
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
}
