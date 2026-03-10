import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node', // Suficiente para lógica matemática pura
        globals: true
    }
})
