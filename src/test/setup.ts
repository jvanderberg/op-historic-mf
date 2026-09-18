import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement scrollIntoView; the app calls it after a drill.
Element.prototype.scrollIntoView = vi.fn();
