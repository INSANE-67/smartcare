import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock server-only to prevent it from throwing in Vitest
vi.mock('server-only', () => ({}));

// Global mock for next/cache to prevent errors when actions call revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Global mock for next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  usePathname: vi.fn(),
}));
