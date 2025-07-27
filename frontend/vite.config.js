import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/app': path.resolve(__dirname, './src/app'),
            '@/entities': path.resolve(__dirname, './src/entities'),
            '@/features': path.resolve(__dirname, './src/features'),
            '@/shared': path.resolve(__dirname, './src/shared'),
            '@/store': path.resolve(__dirname, './src/store'),
            '@/widgets': path.resolve(__dirname, './src/widgets'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/types': path.resolve(__dirname, './src/types'),
            '@/utils': path.resolve(__dirname, './src/utils'),
        },
    },
});
