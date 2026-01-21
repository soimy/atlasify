import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts'],
            thresholds: {
                lines: 90,
                branches: 85,
                functions: 90,
                statements: 90
            }
        },
        testTimeout: 30000,
    },
});
