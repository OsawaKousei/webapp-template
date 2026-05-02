import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { z } from 'zod';

const proxyTargetSchema = z
  .string()
  .min(1)
  .transform((value) => {
    return value.replace(/\/3000$/, ':3000');
  })
  .pipe(z.string().url())
  .refine((value) => {
    const parsed = new URL(value);
    return parsed.hostname === 'api' && parsed.port === '3000';
  }, 'VITE_API_PROXY_TARGET must point to http://api:3000');

const parseProxyTarget = (rawProxyTarget: unknown) => {
  const parsed = proxyTargetSchema.safeParse(rawProxyTarget);

  if (!parsed.success) {
    throw new Error(
      'Invalid VITE_API_PROXY_TARGET. Set VITE_API_PROXY_TARGET to http://api:3000',
    );
  }

  return parsed.data;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = parseProxyTarget(env.VITE_API_PROXY_TARGET);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: ['frontend'],
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    },
  };
});
