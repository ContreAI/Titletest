import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'vendor-react': ['react', 'react-dom', 'react-router'],
            // MUI core
            'vendor-mui': ['@mui/material', '@mui/system'],
            // MUI extras
            'vendor-mui-extras': ['@mui/lab', '@mui/x-date-pickers'],
            // State management
            'vendor-state': ['zustand'],
            // Forms
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'yup'],
            // Charts (ECharts)
            'vendor-charts': ['echarts', 'echarts-for-react'],
            // Markdown
            'vendor-markdown': ['react-markdown', 'remark-gfm'],
            // Utilities
            'vendor-utils': ['date-fns'],
          },
        },
      },
    },
    plugins: [
      tsconfigPaths(),
      react(),
      checker({
        typescript: false, // Temporarily disabled for stub module compatibility
        // eslint: {
        //   useFlatConfig: true,
        //   lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        // },
        overlay: {
          initialIsOpen: false,
        },
      }),
    ],
    preview: {
      port: Number(process.env.VITE_APP_PORT || 5173),
    },
    server: {
      host: '0.0.0.0',
      port: Number(process.env.VITE_APP_PORT || 5173),
      allowedHosts: [
        'localhost',
        '.contre.ai',
      ],
    },
    base: process.env.VITE_BASENAME || '/',
    resolve: {
      alias: {
        'package.json': path.resolve(__dirname, './package.json'),
        '@contreai/api-client': path.resolve(__dirname, './src/stubs/api-client.ts'),
      },
    },
  });
};
