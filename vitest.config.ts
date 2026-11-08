import path from 'node:path';
import { defineConfig } from 'vitest/config';

const fromRoot = (...segments: string[]) => path.resolve(__dirname, ...segments);

/**
 * Unit tests of the pure logic (no browser, no built extension needed).
 * `@extension/storage` is pointed at its source so the tests do not depend on a previous `pnpm build`.
 * The browser based tests live in tests/e2e and are not run here.
 */
export default defineConfig({
  resolve: {
    alias: [
      { find: '@extension/storage', replacement: fromRoot('packages/storage/index.ts') },
      // `@/lib/utils` inside packages/ui
      { find: /^@\/lib\//, replacement: `${fromRoot('packages/ui/lib')}/` },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
