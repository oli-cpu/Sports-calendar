import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative base so the built assets resolve correctly regardless of
  // whether this ends up at a GitHub Pages user/org root
  // (username.github.io) or a project path (username.github.io/repo-name).
  base: './',
})
